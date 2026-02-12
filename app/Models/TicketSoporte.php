<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketSoporte extends Model
{
    protected $table = 'tickets_soporte';

    protected $fillable = [
        'user_id',
        'tecnico_id',
        'asunto',
        'categoria',
        'prioridad',
        'estado',
        'cerrado_at',
    ];

    protected $casts = [
        'cerrado_at' => 'datetime',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function tecnico()
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }

    public function mensajes()
    {
        return $this->hasMany(TicketMensajeSoporte::class, 'ticket_soporte_id');
    }
}

