<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('news')) {
            $addExcerpt = ! Schema::hasColumn('news', 'excerpt');
            $addImage = ! Schema::hasColumn('news', 'image');
            $addCreatedBy = ! Schema::hasColumn('news', 'created_by');

            if ($addExcerpt || $addImage || $addCreatedBy) {
                Schema::table('news', function (Blueprint $table) use ($addExcerpt, $addImage, $addCreatedBy) {
                    if ($addExcerpt) {
                        $table->text('excerpt')->nullable();
                    }
                    if ($addImage) {
                        $table->string('image')->nullable();
                    }
                    if ($addCreatedBy) {
                        $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                    }
                });
            }

            if (Schema::hasColumn('news', 'thumbnail')) {
                DB::table('news')
                    ->whereNull('image')
                    ->whereNotNull('thumbnail')
                    ->update(['image' => DB::raw('thumbnail')]);
            }

            return;
        }

        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['is_published', 'published_at']);
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('news', 'thumbnail')) {
            if (Schema::hasColumn('news', 'created_by')) {
                Schema::table('news', function (Blueprint $table) {
                    $table->dropForeign(['created_by']);
                    $table->dropColumn('created_by');
                });
            }

            $columns = array_values(array_filter(
                ['excerpt', 'image'],
                fn (string $column) => Schema::hasColumn('news', $column)
            ));

            if ($columns !== []) {
                Schema::table('news', fn (Blueprint $table) => $table->dropColumn($columns));
            }

            return;
        }

        Schema::dropIfExists('news');
    }
};
