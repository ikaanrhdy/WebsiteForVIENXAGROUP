<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_products_endpoint_only_returns_active_products(): void
    {
        Product::create(['name' => 'Active product', 'is_active' => true]);
        Product::create(['name' => 'Inactive product', 'is_active' => false]);

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Active product');
    }

    public function test_public_products_can_be_filtered_by_unit_and_featured_status(): void
    {
        Product::create(['name' => 'Featured bakery', 'unit' => 'bakery', 'is_featured' => true]);
        Product::create(['name' => 'Other bakery', 'unit' => 'bakery', 'is_featured' => false]);
        Product::create(['name' => 'Featured catering', 'unit' => 'daopurku-catering', 'is_featured' => true]);

        $this->getJson('/api/products?unit=bakery&featured=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Featured bakery')
            ->assertJsonPath('data.0.unit', 'bakery');
    }

    public function test_super_admin_can_create_product(): void
    {
        $admin = User::create([
            'name' => 'Product Admin',
            'email' => 'product-admin@example.test',
            'password' => 'password',
            'role' => User::ROLE_SUPER_ADMIN,
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->postJson('/api/admin/products', [
                'name' => 'Test product',
                'unit' => 'daopurku-catering',
                'category' => 'Software',
                'price' => 10000,
                'stock' => 3,
                'is_active' => true,
                'is_featured' => false,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Test product')
            ->assertJsonPath('data.creator.name', $admin->name);

        $this->assertDatabaseHas('products', [
            'name' => 'Test product',
            'unit' => 'daopurku-catering',
            'created_by' => $admin->id,
        ]);
    }

    public function test_authenticated_user_can_update_profile_and_password(): void
    {
        $user = User::create([
            'name' => 'Profile User',
            'email' => 'profile-user@example.test',
            'password' => 'old-password',
            'role' => User::ROLE_USER,
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->putJson('/api/auth/profile', [
                'name' => 'Updated User',
                'phone' => '081234567890',
                'current_password' => 'old-password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated User')
            ->assertJsonPath('data.phone', '081234567890');

        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
    }

    public function test_super_admin_can_upload_a_product_image(): void
    {
        Storage::fake('public');
        $admin = User::create([
            'name' => 'Product Admin',
            'email' => 'product-upload-admin@example.test',
            'password' => 'password',
            'role' => User::ROLE_SUPER_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->post('/api/admin/upload/image', [
                'image' => UploadedFile::fake()->createWithContent(
                    'product.gif',
                    base64_decode('R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=')
                ),
                'folder' => 'products',
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonStructure(['path']);

        Storage::disk('public')->assertExists($response->json('path'));
        $this->assertStringStartsWith('products/', $response->json('path'));
    }
}
