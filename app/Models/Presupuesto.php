<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presupuesto extends Model
{
    protected $fillable = [
        'solicitud_reparacion_id',
        'tecnico_id',
        'importe_total',
        'descripcion',
        'estado',
    ];

    public function solicitudReparacion()
    {
        return $this->belongsTo(SolicitudReparacion::class, 'solicitud_reparacion_id');
    }

    public function tecnico()
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }
}

