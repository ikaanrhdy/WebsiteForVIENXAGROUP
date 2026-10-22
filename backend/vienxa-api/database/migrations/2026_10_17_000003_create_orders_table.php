<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('package_id')->nullable()->constrained()->nullOnDelete();
            $table->string('code', 24)->unique();
            $table->string('project_name');
            $table->text('description');
            $table->string('status', 20)->default('menunggu')->index(); // menunggu|diproses|selesai|dibatalkan
            $table->unsignedBigInteger('amount')->nullable();           // nilai kesepakatan (Rp)
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
