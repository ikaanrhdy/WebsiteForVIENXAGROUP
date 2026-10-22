<?php

namespace Tests\Feature;

use App\Models\News;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class NewsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_news_endpoint_returns_published_news_as_a_data_collection(): void
    {
        News::create([
            'title' => 'Published story',
            'is_published' => true,
        ]);
        News::create([
            'title' => 'Draft story',
            'is_published' => false,
        ]);

        $this->getJson('/api/news')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Published story');
    }

    public function test_super_admin_can_create_news(): void
    {
        $admin = User::create([
            'name' => 'News Admin',
            'email' => 'news-admin@example.test',
            'password' => 'password',
            'role' => User::ROLE_SUPER_ADMIN,
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->postJson('/api/admin/news', [
                'title' => 'Admin story',
                'excerpt' => 'A short summary',
                'is_published' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Admin story')
            ->assertJsonPath('data.author.name', $admin->name);

        $this->assertDatabaseHas('news', [
            'title' => 'Admin story',
            'created_by' => $admin->id,
        ]);
    }

    public function test_super_admin_can_upload_a_news_image(): void
    {
        Storage::fake('public');
        $admin = User::create([
            'name' => 'News Admin',
            'email' => 'news-upload-admin@example.test',
            'password' => 'password',
            'role' => User::ROLE_SUPER_ADMIN,
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)
            ->post('/api/admin/upload/image', [
                'image' => UploadedFile::fake()->createWithContent(
                    'news.gif',
                    base64_decode('R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=')
                ),
                'folder' => 'news',
            ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonStructure(['path']);

        Storage::disk('public')->assertExists($response->json('path'));
        $this->assertStringStartsWith('news/', $response->json('path'));
    }
}
