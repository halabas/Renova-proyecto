<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SolicitudReparacion extends Model
{
    protected $table = 'solicitudes_reparacion';

    protected $fillable = [
        'user_id',
        'tecnico_id',
        'nombre_completo',
        'telefono',
        'email',
        'modelo_dispositivo',
        'tipo_problema',
        'descripcion',
        'modalidad',
        'estado',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tecnico()
    {
        return $this->belongsTo(User::class, 'tecnico_id');
    }

    public function presupuesto()
    {
        return $this->hasOne(Presupuesto::class, 'solicitud_reparacion_id');
    }
}
