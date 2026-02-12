<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TicketMensajeSoporte extends Model
{
    protected $table = 'ticket_mensajes_soporte';

    protected $fillable = [
        'ticket_soporte_id',
        'user_id',
        'mensaje',
    ];

    public function ticket()
    {
        return $this->belongsTo(TicketSoporte::class, 'ticket_soporte_id');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

