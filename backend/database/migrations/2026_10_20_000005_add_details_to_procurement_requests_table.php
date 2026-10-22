<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('procurement_requests', function (Blueprint $table) {
            $table->string('organization_name', 180)->nullable()->after('title');
            $table->string('representative_name', 150)->nullable()->after('organization_name');
            $table->text('organization_address')->nullable()->after('representative_name');
            $table->string('contact_phone', 32)->nullable()->after('organization_address');
            $table->string('organization_tax_id', 40)->nullable()->after('contact_phone');
            $table->string('item_unit', 40)->nullable()->after('item_name');
        });
    }

    public function down(): void
    {
        Schema::table('procurement_requests', function (Blueprint $table) {
            $table->dropColumn([
                'organization_name',
                'representative_name',
                'organization_address',
                'contact_phone',
                'organization_tax_id',
                'item_unit',
            ]);
        });
    }
};
