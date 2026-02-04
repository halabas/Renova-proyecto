<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ProductoCarrito;

class Movil extends Model
{
    use HasFactory;

     protected $table = 'moviles';
    protected $fillable = ['modelo_id', 'color', 'grado', 'almacenamiento', 'stock'];

    public function modelo()
    {
        return $this->belongsTo(Modelo::class);
    }

    public function productosCarrito()
    {
        return $this->morphMany(ProductoCarrito::class, 'producto');
    }
}
