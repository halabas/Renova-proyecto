<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ProductoCarrito;

class Componente extends Model
{
    use HasFactory;

    protected $fillable = ['nombre', 'categoria_id', 'modelo_id', 'precio', 'stock'];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function modelo()
    {
        return $this->belongsTo(Modelo::class);
    }

    public function productosCarrito()
    {
        return $this->morphMany(ProductoCarrito::class, 'producto');
    }
}
