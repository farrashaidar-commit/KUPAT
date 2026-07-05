<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$userId = 1;
$transactionService = app()->make(App\Services\TransactionService::class);
$dashboardService = app()->make(App\Services\DashboardService::class);

echo "Before creating test transaction:\n";
$before = $dashboardService->getDashboard($userId);
echo "Monthly income before: " . ($before['statistics']['monthly_income']['value'] ?? 'N/A') . "\n";
echo "Header balance before: " . ($before['header']['balance'] ?? 'N/A') . "\n";

$txData = [
    'category_id' => null,
    'amount' => 123456,
    'type' => 'income',
    'description' => 'auto-test income',
    'transaction_date' => \Carbon\Carbon::now()->toDateTimeString(),
];

$tx = $transactionService->createForUser($userId, $txData);

echo "Created transaction id: " . ($tx->id ?? 'null') . " amount: " . ($tx->amount ?? 'null') . "\n";

$after = $dashboardService->getDashboard($userId);
echo "After creating test transaction:\n";
echo "Monthly income after: " . ($after['statistics']['monthly_income']['value'] ?? 'N/A') . "\n";
echo "Header balance after: " . ($after['header']['balance'] ?? 'N/A') . "\n";

// cleanup: delete the created transaction to avoid polluting data
try {
    $transactionService->delete($tx->id);
    echo "Test transaction deleted.\n";
} catch (\Throwable $e) {
    echo "Failed to delete test transaction: " . $e->getMessage() . "\n";
}
