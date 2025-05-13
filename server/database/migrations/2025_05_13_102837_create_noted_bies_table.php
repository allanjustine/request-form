<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('noted_bies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained("users", "id")->onDelete('cascade');
            $table->foreignId('noted_by')->constrained("users", "id")->onDelete('cascade');
            $table->integer("level");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('noted_bies');
    }
};
