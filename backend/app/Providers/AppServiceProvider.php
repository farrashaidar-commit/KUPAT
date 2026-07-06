<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            \App\Repositories\Contracts\UserRepositoryInterface::class,
            \App\Repositories\Eloquent\EloquentUserRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\CategoryRepositoryInterface::class,
            \App\Repositories\Eloquent\EloquentCategoryRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\BudgetRepositoryInterface::class,
            \App\Repositories\Eloquent\EloquentBudgetRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\TransactionRepositoryInterface::class,
            \App\Repositories\Eloquent\EloquentTransactionRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\DashboardRepositoryInterface::class,
            \App\Repositories\Eloquent\EloquentDashboardRepository::class
        );
        $this->app->bind(
            \App\Repositories\Contracts\FinancialGoalRepositoryInterface::class,
            \App\Repositories\Eloquent\EloquentFinancialGoalRepository::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
