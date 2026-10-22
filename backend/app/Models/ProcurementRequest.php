<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ProcurementRequest extends Model
{
    public const PENDING = 'menunggu';

    public const APPROVED = 'disetujui';

    public const REJECTED = 'ditolak';

    public const STATUSES = [self::PENDING, self::APPROVED, self::REJECTED];

    protected $fillable = [
        'user_id',
        'code',
        'title',
        'organization_name',
        'representative_name',
        'organization_address',
        'contact_phone',
        'organization_tax_id',
        'item_name',
        'item_unit',
        'quantity',
        'estimated_budget',
        'description',
        'status',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'estimated_budget' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (ProcurementRequest $request) {
            $request->status ??= self::PENDING;
            if (blank($request->code)) {
                do {
                    $code = 'VX-PGN-'.now()->format('ymd').'-'.strtoupper(Str::random(4));
                } while (static::where('code', $code)->exists());
                $request->code = $code;
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
