<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductReviewApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_details_include_rating_reviews_and_completed_sales(): void
    {
        $buyer = $this->buyer();
        $product = Product::create(['name' => 'Test product', 'price' => 12000, 'stock' => 5, 'is_active' => true]);
        $completed = $buyer->orders()->create([
            'project_name' => 'Product order',
            'description' => 'Completed product order',
            'status' => Order::DONE,
        ]);
        $completed->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => $product->price,
            'quantity' => 3,
        ]);
        $pending = $buyer->orders()->create([
            'project_name' => 'Pending order',
            'description' => 'Pending product order',
        ]);
        $pending->items()->create([
            'product_id' => $product->id,
            'product_name' => $product->name,
            'unit_price' => $product->price,
            'quantity' => 8,
        ]);

        $this->actingAs($buyer)
            ->postJson("/api/me/products/{$product->id}/reviews", [
                'rating' => 5,
                'review' => 'Produk bagus dan sesuai.',
            ])
            ->assertCreated();

        $this->getJson("/api/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.sold_count', 3)
            ->assertJsonPath('data.rating', 5)
            ->assertJsonPath('data.reviews_count', 1)
            ->assertJsonPath('data.reviews.0.review', 'Produk bagus dan sesuai.')
            ->assertJsonPath('data.reviews.0.user.name', $buyer->name);
    }

    public function test_buyer_can_only_review_a_product_from_a_completed_order(): void
    {
        $buyer = $this->buyer();
        $product = Product::create(['name' => 'Not purchased', 'is_active' => true]);

        $this->actingAs($buyer)
            ->postJson("/api/me/products/{$product->id}/reviews", ['rating' => 4, 'review' => 'Test'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('review');

        $this->assertDatabaseCount('product_reviews', 0);
    }

    private function buyer(): User
    {
        return User::create([
            'name' => 'Product Buyer',
            'email' => 'product-buyer@example.test',
            'password' => 'password',
            'role' => User::ROLE_USER,
            'is_active' => true,
        ]);
    }
}
