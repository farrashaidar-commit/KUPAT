# PERFORMANCE AUDIT REPORT

## 1. Root Cause
Dashboard terasa lambat saat login, refresh, dan pembukaan pertama karena ada beberapa bottleneck yang terjadi secara bersamaan:

1. Alur startup frontend memicu beberapa request yang sebenarnya bisa dihindari.
2. Dashboard memanggil data yang tidak selalu diperlukan pada initial render, sehingga UI menunggu lebih lama sebelum angka dan grafik muncul.
3. Backend dashboard melakukan beberapa perhitungan dan query yang berulang, termasuk query transaksi per kategori dan penghitungan insight yang cukup berat.
4. UI menampilkan angka default (misalnya Rp 0) sebelum data benar-benar tersedia, sehingga pengguna melihat hasil yang "kosong" dan merasa aplikasi lambat.

## 2. Lokasi Masalah

### A. Frontend - duplicate and unnecessary fetches
- File: [frontend/src/App.tsx](frontend/src/App.tsx)
- Function: ProtectedRoute
- Masalah: Setelah session berhasil dipulihkan, aplikasi memanggil fetch user. Setelah user tersedia, komponen lain juga memulai request dashboard dan transaksi secara terpisah.

- File: [frontend/src/components/Layout.tsx](frontend/src/components/Layout.tsx)
- Function: Layout useEffect
- Masalah: Layout memanggil fetchDashboard ketika dashboardData belum ada, sehingga request dashboard dipicu dari shell layout.

- File: [frontend/src/pages/Dashboard.tsx](frontend/src/pages/Dashboard.tsx)
- Function: Dashboard useEffect
- Masalah: Dashboard memanggil fetchDashboard, fetchTransactions, fetchHealthScore, dan fetchInsights pada mount. Ini menyebabkan beban request yang lebih besar daripada yang dibutuhkan untuk render awal.

### B. Frontend - unnecessary dependency on full transaction list
- File: [frontend/src/pages/Dashboard.tsx](frontend/src/pages/Dashboard.tsx)
- Function: Dashboard render logic
- Masalah: Dashboard sebenarnya bisa menggunakan recent_transactions dari endpoint dashboard, tetapi tetap memanggil transaksi lengkap dan mengandalkan state transaksi untuk render awal.

### C. Backend - heavy dashboard computation
- File: [backend/app/Services/DashboardService.php](backend/app/Services/DashboardService.php)
- Function: getDashboard
- Masalah: Endpoint dashboard memanggil banyak sumber data sekaligus: balance, income/expense, budget, goals, notifications, health score, smart insights, recent transactions, dan budget progress. Semua ini dieksekusi dalam satu request, sehingga waktu respons meningkat.

### D. Backend - repeated query patterns
- File: [backend/app/Services/SmartFeatureService.php](backend/app/Services/SmartFeatureService.php)
- Function: getBudgetHealthScore
- Masalah: Untuk setiap budget, service memanggil query transaksi kategori secara terpisah. Ini berpotensi menjadi pola N+1 query ketika user memiliki banyak budget.

- File: [backend/app/Services/SmartFeatureService.php](backend/app/Services/SmartFeatureService.php)
- Function: getSmartInsights
- Masalah: Endpoint insight memanggil ulang data transaksi bulanan dan kemudian menyimpan insight ke database. Ini menambah beban yang tidak selalu dibutuhkan saat dashboard pertama kali dimuat.

### E. Backend - repeated calculation work
- File: [backend/app/Services/DashboardService.php](backend/app/Services/DashboardService.php)
- Function: getDashboard / buildStatistics
- Masalah: Budget calculation dipanggil lebih dari sekali untuk data yang serupa, sehingga ada pekerjaan yang diulang.

## 3. Dampak
- Saat login atau refresh, pengguna melihat angka awal Rp 0 dan widget kosong sebelum data selesai dimuat.
- Dashboard terasa seperti "loading beruntun" karena widget muncul satu per satu.
- Waktu respons awal meningkat karena request yang duplikat dan perhitungan backend yang berat.
- Halaman terasa lambat meskipun data transaksi dan budget sedikit karena ada banyak pekerjaan yang dilakukan sebelum UI siap.

## 4. Prioritas

### Critical
- Duplicate dashboard fetches dari frontend saat initial load.
- Dashboard endpoint memuat data yang terlalu berat pada first render.

### High
- Smart insights dan budget health score melakukan query berulang yang memperlambat response dashboard.
- UI menampilkan nilai default sebelum data siap, mengurangi rasa responsif aplikasi.

### Medium
- Dashboard memanggil data transaksi lengkap yang sebenarnya tidak selalu diperlukan untuk render awal.
- Ada beberapa perhitungan backend yang diulang untuk data serupa.

## 5. Rekomendasi Perbaikan
Langkah perbaikan paling aman dan minim risiko:

1. Batasi request awal dashboard agar hanya satu request dashboard yang dieksekusi saat aplikasi pertama kali siap.
2. Hindari memanggil fetchDashboard dari layout dan page dashboard secara bersamaan untuk data yang sama.
3. Saat initial load, prioritaskan data yang benar-benar dibutuhkan untuk menampilkan shell dashboard lebih cepat, lalu isi data tambahan setelahnya.
4. Kurangi beban backend dengan menggabungkan perhitungan budget dan insight yang bisa diproses lebih efisien.
5. Hindari query transaksi berulang per budget di smart insight; gunakan satu query agregat untuk semua kategori yang terikat budget.
6. Tambahkan placeholder/loading yang lebih tepat sehingga pengguna tidak melihat angka nol yang terlihat seperti error atau data belum siap.
7. Setelah implementasi, verifikasi kembali alur login, refresh halaman, dan navigasi antar halaman untuk memastikan tidak ada regresi.
