<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Order extends Model
{
    public const PENDING = 'menunggu';

    public const PROCESSING = 'diproses';

    public const DONE = 'selesai';

    public const CANCELLED = 'dibatalkan';

    public const STATUSES = [self::PENDING, self::PROCESSING, self::DONE, self::CANCELLED];

    protected $fillable = ['user_id', 'package_id', 'code', 'project_name', 'description', 'status', 'amount', 'admin_notes'];

    protected function casts(): array
    {
        return ['amount' => 'integer'];
    }

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            $order->status ??= self::PENDING;
            if (blank($order->code)) {
                do {
                    $code = 'VX-'.now()->format('ymd').'-'.strtoupper(Str::random(4));
                } while (static::where('code', $code)->exists());
                $order->code = $code;
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
