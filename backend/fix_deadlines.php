<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

$rows = DB::table('financial_goals')->whereNotNull('deadline')->whereRaw("strftime('%Y', deadline) = '2006'")->get();
if ($rows->isEmpty()) {
    echo "No rows found with year 2006.\n";
    exit(0);
}

foreach ($rows as $r) {
    echo "Before: id={$r->id} name={$r->name} deadline={$r->deadline}\n";
}

// Use SQLite-compatible date arithmetic (date(..., '+20 years')) or SQL DATE_ADD on other DBs
$updated = DB::update("UPDATE financial_goals SET deadline = date(deadline, '+20 years') WHERE strftime('%Y', deadline) = '2006'");

echo "Updated rows: {$updated}\n";

$rowsAfter = DB::table('financial_goals')->whereNotNull('deadline')->whereRaw("strftime('%Y', deadline) = '2026'")->get();
foreach ($rowsAfter as $r) {
    echo "After: id={$r->id} name={$r->name} deadline={$r->deadline}\n";
}
