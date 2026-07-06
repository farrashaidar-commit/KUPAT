<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\FinancialGoal;

$goals = FinancialGoal::all();
if ($goals->isEmpty()) {
    echo "No financial goals found.\n";
    exit(0);
}

foreach ($goals as $goal) {
    $attrs = $goal->getAttributes();
    $raw = array_key_exists('deadline', $attrs) ? $attrs['deadline'] : null;
    $casted = null;
    if ($goal->deadline instanceof \Illuminate\Support\Carbon) {
        $casted = $goal->deadline->toDateString();
    } elseif ($goal->deadline) {
        $casted = (string) $goal->deadline;
    }

    echo sprintf("%d | %s | raw=%s | cast=%s\n", $goal->id, $goal->name, var_export($raw, true), var_export($casted, true));
}
