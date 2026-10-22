<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('procurement_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('code', 24)->unique();
            $table->string('title', 150);
            $table->string('item_name', 180);
            $table->unsignedInteger('quantity');
            $table->unsignedBigInteger('estimated_budget')->nullable();
            $table->text('description');
            $table->string('status', 20)->default('menunggu')->index();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procurement_requests');
    }
};
