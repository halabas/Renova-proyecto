<?php

namespace Tests\Feature\Carrito;

use App\Models\Categoria;
use App\Models\Componente;
use App\Models\Marca;
use App\Models\Modelo;
use App\Models\ProductoCarrito;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompraTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_autenticado_puede_anadir_componente_al_carrito(): void
    {
        $user = User::factory()->create();
        $marca = Marca::create(['nombre' => 'Apple']);
        $modelo = Modelo::create([
            'nombre' => 'iPhone 13',
            'marca_id' => $marca->id,
            'precio_base' => 600,
            'descripcion' => 'Modelo de prueba',
            'fotos' => '/storage/modelos/test.jpg',
        ]);
        $categoria = Categoria::create(['nombre' => 'Pantalla']);
        $componente = Componente::create([
            'nombre' => 'Pantalla iPhone 13',
            'categoria_id' => $categoria->id,
            'modelo_id' => $modelo->id,
            'precio' => 99.90,
            'stock' => 5,
            'descripcion' => 'Componente de prueba',
            'fotos' => '/storage/componentes/test.jpg',
        ]);

        $response = $this->actingAs($user)->post(route('carrito.store'), [
            'tipo' => 'componente',
            'id' => $componente->id,
            'cantidad' => 2,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('producto_carritos', [
            'user_id' => $user->id,
            'producto_type' => Componente::class,
            'producto_id' => $componente->id,
            'cantidad' => 2,
        ]);
    }

    public function test_checkout_falla_si_el_carrito_esta_vacio(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('carrito.checkout'), [
            'direccion_id' => 999,
        ]);

        $response->assertRedirect(route('carrito.index'));
        $response->assertSessionHas('error', 'Tu carrito está vacío.');
    }

    public function test_update_cantidad_falla_si_supera_stock_disponible(): void
    {
        $user = User::factory()->create();
        $marca = Marca::create(['nombre' => 'Samsung']);
        $modelo = Modelo::create([
            'nombre' => 'Galaxy S23',
            'marca_id' => $marca->id,
            'precio_base' => 700,
            'descripcion' => 'Modelo de prueba',
            'fotos' => '/storage/modelos/test.jpg',
        ]);
        $categoria = Categoria::create(['nombre' => 'Bateria']);
        $componente = Componente::create([
            'nombre' => 'Bateria Galaxy S23',
            'categoria_id' => $categoria->id,
            'modelo_id' => $modelo->id,
            'precio' => 49.90,
            'stock' => 1,
            'descripcion' => 'Componente de prueba',
            'fotos' => '/storage/componentes/test.jpg',
        ]);

        $fila = ProductoCarrito::create([
            'user_id' => $user->id,
            'producto_type' => Componente::class,
            'producto_id' => $componente->id,
            'cantidad' => 1,
            'precio_unitario' => 49.90,
        ]);

        $response = $this->actingAs($user)->patch(route('carrito.update', $fila), [
            'cantidad' => 3,
        ]);

        $response->assertSessionHasErrors('stock');
    }
}
