<?php

namespace Tests\Feature;

use App\Models\AppNotification;
use App\Models\Order;
use App\Models\ProcurementRequest;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DashboardCommerceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_checkout_cart_and_stock_and_order_items_are_recorded(): void
    {
        $customer = $this->customer();
        $product = Product::create([
            'name' => 'Snack box',
            'unit' => 'daopurku-catering',
            'price' => 25000,
            'stock' => 8,
            'is_active' => true,
        ]);

        $this->actingAs($customer)
            ->postJson('/api/me/cart/items', ['product_id' => $product->id, 'quantity' => 2])
            ->assertCreated();
        $this->actingAs($customer)
            ->postJson('/api/me/cart/checkout')
            ->assertCreated()
            ->assertJsonPath('data.amount', 50000)
            ->assertJsonPath('data.items.0.product_name', 'Snack box')
            ->assertJsonPath('data.items.0.quantity', 2);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 6]);
        $this->assertDatabaseHas('order_items', ['product_id' => $product->id, 'quantity' => 2]);
        $this->assertDatabaseHas('app_notifications', ['audience' => 'admin', 'title' => 'Pesanan produk baru']);
        $this->assertDatabaseHas('app_notifications', ['audience' => 'user', 'user_id' => $customer->id]);
        $this->actingAs($customer)->getJson('/api/me/cart')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_customer_can_submit_procurement_request_and_admin_can_confirm_it_once(): void
    {
        $customer = $this->customer();
        $otherCustomer = $this->customer();
        $admin = $this->admin();

        $created = $this->actingAs($customer)
            ->postJson('/api/me/pengadaan', [
                'title' => 'Perlengkapan kantor',
                'organization_name' => 'VIENXA',
                'representative_name' => 'Kevin Setiawan',
                'organization_address' => 'Jakarta',
                'contact_phone' => '081234567890',
                'organization_tax_id' => '01.234.567.8-901.000',
                'item_name' => 'Kursi kerja',
                'item_unit' => 'pcs',
                'quantity' => 4,
                'estimated_budget' => 2500000,
                'description' => 'Kursi ergonomis untuk ruang kerja.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', ProcurementRequest::PENDING)
            ->assertJsonPath('data.quantity', 4)
            ->assertJsonPath('data.organization_name', 'VIENXA')
            ->assertJsonPath('data.item_unit', 'pcs');
        $requestId = $created->json('data.id');

        $this->assertDatabaseHas('app_notifications', [
            'audience' => 'admin',
            'title' => 'Pengajuan pengadaan baru',
        ]);
        $this->actingAs($otherCustomer)
            ->getJson('/api/me/pengadaan')
            ->assertOk()
            ->assertJsonCount(0, 'data');
        $this->actingAs($customer)
            ->getJson('/api/admin/pengadaan')
            ->assertForbidden();

        $this->actingAs($admin)
            ->getJson('/api/admin/pengadaan?status=menunggu')
            ->assertOk()
            ->assertJsonPath('data.0.user.id', $customer->id);
        $this->actingAs($admin)
            ->putJson("/api/admin/pengadaan/{$requestId}", [
                'status' => ProcurementRequest::APPROVED,
                'admin_notes' => 'Disetujui.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', ProcurementRequest::APPROVED);
        $this->actingAs($admin)
            ->getJson("/api/admin/pengadaan/{$requestId}")
            ->assertOk()
            ->assertJsonPath('data.user.id', $customer->id);
        $this->actingAs($customer)
            ->getJson("/api/admin/pengadaan/{$requestId}")
            ->assertForbidden();

        $this->actingAs($customer)
            ->getJson('/api/me/pengadaan')
            ->assertJsonPath('data.0.admin_notes', 'Disetujui.');
        $this->assertDatabaseHas('app_notifications', [
            'audience' => 'user',
            'user_id' => $customer->id,
            'title' => 'Status pengajuan diperbarui',
        ]);
        $this->actingAs($admin)
            ->putJson("/api/admin/pengadaan/{$requestId}", [
                'status' => ProcurementRequest::REJECTED,
            ])
            ->assertUnprocessable();
    }

    public function test_customer_and_admin_can_exchange_sales_chat_messages(): void
    {
        $customer = $this->customer();
        $admin = $this->admin();

        $this->actingAs($customer)
            ->postJson('/api/me/sales-chat', ['message' => 'Apakah produk tersedia?'])
            ->assertCreated();
        $this->actingAs($admin)
            ->getJson('/api/admin/sales-chat/conversations')
            ->assertOk()
            ->assertJsonPath('data.0.id', $customer->id)
            ->assertJsonPath('data.0.unread_count', 1);
        $this->actingAs($admin)
            ->postJson("/api/admin/sales-chat/{$customer->id}/messages", ['message' => 'Tersedia.'])
            ->assertCreated();
        $this->actingAs($customer)
            ->getJson('/api/me/sales-chat')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.1.message', 'Tersedia.');
        $this->actingAs($customer)
            ->getJson('/api/admin/sales-chat/conversations')
            ->assertForbidden();
    }

    public function test_user_can_update_profile_photo_and_notification_read_state(): void
    {
        Storage::fake('public');
        $customer = $this->customer();
        $notification = AppNotification::create([
            'audience' => 'user',
            'user_id' => $customer->id,
            'title' => 'Test',
            'message' => 'Testing notification',
        ]);

        $this->actingAs($customer)
            ->post('/api/auth/profile', [
                'name' => 'Updated Buyer',
                'phone' => '081234567890',
                'avatar' => UploadedFile::fake()->createWithContent(
                    'avatar.png',
                    base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWZsAAAAASUVORK5CYII=')
                ),
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Buyer')
            ->assertJsonPath('data.avatar', fn ($value) => str_contains($value, 'profiles/'));

        Storage::disk('public')->assertExists($customer->fresh()->avatar_path);
        $this->actingAs($customer)
            ->postJson("/api/notifications/{$notification->id}/read")
            ->assertOk();
        $this->assertNotNull($notification->fresh()->read_at);
        $this->assertTrue(Hash::check('password', $customer->password));
    }

    public function test_customer_cannot_checkout_empty_cart_or_exceed_stock(): void
    {
        $customer = $this->customer();
        $product = Product::create(['name' => 'Limited item', 'stock' => 1, 'is_active' => true]);

        $this->actingAs($customer)->postJson('/api/me/cart/checkout')->assertUnprocessable();
        $this->actingAs($customer)
            ->postJson('/api/me/cart/items', ['product_id' => $product->id, 'quantity' => 2])
            ->assertUnprocessable();
        $this->assertSame(1, $product->fresh()->stock);
        $this->assertSame(0, Order::count());
    }

    public function test_cancelling_a_product_order_restores_inventory(): void
    {
        $customer = $this->customer();
        $product = Product::create(['name' => 'Catering set', 'stock' => 5, 'price' => 30000, 'is_active' => true]);
        $this->actingAs($customer)->postJson('/api/me/cart/items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ])->assertCreated();
        $response = $this->actingAs($customer)->postJson('/api/me/cart/checkout')->assertCreated();

        $this->actingAs($customer)
            ->postJson("/api/me/orders/{$response->json('data.id')}/cancel")
            ->assertOk();

        $this->assertSame(5, $product->fresh()->stock);
    }

    private function customer(): User
    {
        return User::create([
            'name' => 'Test buyer',
            'email' => uniqid('buyer').'@example.test',
            'password' => 'password',
            'role' => User::ROLE_USER,
            'is_active' => true,
        ]);
    }

    private function admin(): User
    {
        return User::create([
            'name' => 'Test admin',
            'email' => uniqid('admin').'@example.test',
            'password' => 'password',
            'role' => User::ROLE_SUPER_ADMIN,
            'is_active' => true,
        ]);
    }
}
