<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
try {
	$svc = app()->make(App\Services\DashboardService::class);
	$res = $svc->getDashboard(1);
	echo json_encode($res, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
} catch (\Throwable $e) {
	echo "Exception: " . $e->getMessage() . PHP_EOL;
	echo "Trace:\n" . $e->getTraceAsString() . PHP_EOL;
	// try to inspect repository outputs
	try {
		$repo = app()->make(App\Repositories\Contracts\DashboardRepositoryInterface::class);
		$now = \Illuminate\Support\Carbon::now();
		$start = $now->copy()->startOfMonth()->startOfDay()->toDateTimeString();
		$end = $now->copy()->endOfMonth()->endOfDay()->toDateTimeString();
		echo "Repo getMonthlyIncomeExpenses: \n";
		var_export($repo->getMonthlyIncomeExpenses(1, $start, $end));
		echo PHP_EOL;
		echo "Repo getPreviousPeriodIncomeExpenses: \n";
		var_export($repo->getPreviousPeriodIncomeExpenses(1, $start, $end));
		echo PHP_EOL;
	} catch (\Throwable $ex) {
		echo "Repo exception: " . $ex->getMessage() . PHP_EOL;
	}
}
