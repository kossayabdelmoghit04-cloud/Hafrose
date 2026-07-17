<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Contracts\CategoryRepositoryInterface;
use App\Repositories\Eloquent\CategoryRepository;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Repositories\Eloquent\ProductRepository;
use App\Repositories\Contracts\ReviewRepositoryInterface;
use App\Repositories\Eloquent\ReviewRepository;
use App\Repositories\Contracts\ContactRepositoryInterface;
use App\Repositories\Eloquent\ContactRepository;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Eloquent\OrderRepository;
use App\Repositories\Contracts\SettingRepositoryInterface;
use App\Repositories\Eloquent\SettingRepository;
use App\Repositories\Contracts\MediaRepositoryInterface;
use App\Repositories\Eloquent\MediaRepository;
use App\Repositories\Contracts\WishlistRepositoryInterface;
use App\Repositories\Eloquent\WishlistRepository;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Enregistrer les liaisons de dépôts dans le conteneur de services.
     */
    public function register(): void
    {
        $this->app->bind(CategoryRepositoryInterface::class, CategoryRepository::class);
        $this->app->bind(ProductRepositoryInterface::class, ProductRepository::class);
        $this->app->bind(ReviewRepositoryInterface::class, ReviewRepository::class);
        $this->app->bind(ContactRepositoryInterface::class, ContactRepository::class);
        $this->app->bind(OrderRepositoryInterface::class, OrderRepository::class);
        $this->app->bind(SettingRepositoryInterface::class, SettingRepository::class);
        $this->app->bind(MediaRepositoryInterface::class, MediaRepository::class);
        $this->app->bind(WishlistRepositoryInterface::class, WishlistRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
