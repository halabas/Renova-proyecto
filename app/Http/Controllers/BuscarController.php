<?php

namespace App\Http\Controllers;

use App\Models\Movil;
use App\Support\Colores;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BuscarController extends Controller
{
    use Colores;
    public function index(Request $request)
    {
        // Obtenemos la busqueda y filtros.
        $busqueda = trim((string) $request->query('busqueda', ''));
        $tipo = $request->query('tipo', 'todos');
        $marca = $request->query('marca');
        $categoria = $request->query('categoria');
        $color = $request->query('color');
        $modeloCompatible = $request->query('modelo');
        $precioMaximo = is_numeric($request->query('max')) ? (float) $request->query('max') : null;
        $orden = $request->query('orden', 'nombre_asc');
        // Hacemos la consulta de modelos y comprobamos que filtrar.
        $consultaModelos = DB::table('modelos')
            ->join('marcas', 'marcas.id', '=', 'modelos.marca_id')
            ->selectRaw("
                modelos.id as id,
                'modelo' as tipo,
                (marcas.nombre || ' ' || modelos.nombre) as nombre,
                marcas.nombre as marca,
                null as categoria,
                null as modelo_compatible,
                modelos.precio_base::float as precio,
                nullif(split_part(coalesce(modelos.fotos, ''), ',', 1), '') as imagen
            ");

        if ($busqueda !== '') {
            $consultaModelos->where(function ($w) use ($busqueda) {
                $w->where('modelos.nombre', 'ilike', "%{$busqueda}%")
                    ->orWhere('marcas.nombre', 'ilike', "%{$busqueda}%");
            });
        }
        if ($marca) {
            $consultaModelos->where('marcas.nombre', $marca);
        }
        if ($color) {
            $consultaModelos->whereExists(function ($q) use ($color) {
                $q->select(DB::raw(1))
                    ->from('moviles')
                    ->whereColumn('moviles.modelo_id', 'modelos.id')
                    ->where('moviles.color', $color);
            });
        }
        if ($precioMaximo !== null) {
            $consultaModelos->where('modelos.precio_base', '<=', $precioMaximo);
        }

        // Hacemos la consulta de componentes y comprobamos que filtrar.
        $consultaComponentes = DB::table('componentes')
            ->join('modelos', 'modelos.id', '=', 'componentes.modelo_id')
            ->join('marcas', 'marcas.id', '=', 'modelos.marca_id')
            ->join('categorias', 'categorias.id', '=', 'componentes.categoria_id')
            ->selectRaw("
                componentes.id as id,
                'componente' as tipo,
                componentes.nombre as nombre,
                null as marca,
                categorias.nombre as categoria,
                (marcas.nombre || ' ' || modelos.nombre) as modelo_compatible,
                componentes.precio::float as precio,
                nullif(split_part(coalesce(componentes.fotos, ''), ',', 1), '') as imagen
            ");

        if ($busqueda !== '') {
            $consultaComponentes->where(function ($w) use ($busqueda) {
                $w->where('componentes.nombre', 'ilike', "%{$busqueda}%")
                    ->orWhere('categorias.nombre', 'ilike', "%{$busqueda}%");
            });
        }
        if ($categoria) {
            $consultaComponentes->where('categorias.nombre', $categoria);
        }
        if ($modeloCompatible) {
            $consultaComponentes->where('modelos.id', $modeloCompatible);
        }
        if ($precioMaximo !== null) {
            $consultaComponentes->where('componentes.precio', '<=', $precioMaximo);
        }

        // Segun el tipo seleccionado ejecutamos una query u otra , o la union de ambas para poder paginar.
        if ($tipo === 'modelo') {
            $vista = DB::query()->fromSub($consultaModelos, 'r');
        } elseif ($tipo === 'componente') {
            $vista = DB::query()->fromSub($consultaComponentes, 'r');
        } else {
            $vista = DB::query()->fromSub($consultaModelos->unionAll($consultaComponentes), 'r');
        }

        // Ejecutamos la ordenacion.
        if ($orden === 'nombre_desc') {
            $vista->orderBy('nombre', 'desc');
        } elseif ($orden === 'precio_asc') {
            $vista->orderBy('precio', 'asc');
        } elseif ($orden === 'precio_desc') {
            $vista->orderBy('precio', 'desc');
        } else {
            $vista->orderBy('nombre', 'asc');
        }

        // Comprobamos si es una peticion json para pasar los resultados cortos.
        if ($request->wantsJson()) {
            $resultadoCorto = $vista->limit(8)->get();
            return response()->json([
                'resultados' => $resultadoCorto,
            ]);
        }

        // Si es navegación normal, renderiza la pagina con Inertia.
        $paginador = $vista->paginate(12)->withQueryString();
        $paginador->setCollection(
            $this->ponerExtras($paginador->getCollection())
        );

        return Inertia::render('busqueda/index', [
            'busqueda' => $busqueda,
            'resultados' => $paginador,
            'tipo' => $tipo,
            'marca' => $marca,
            'categoria' => $categoria,
            'color' => $color,
            'modelo' => $modeloCompatible,
            'max' => $precioMaximo,
            'orden' => $orden,
            'marcas' => $tipo === 'modelo' ? DB::table('marcas')->orderBy('nombre')->pluck('nombre') : [],
            'categorias' => $tipo === 'componente' ? DB::table('categorias')->orderBy('nombre')->pluck('nombre') : [],
            'colores' => $tipo === 'modelo' ? DB::table('moviles')->select('color')->distinct()->orderBy('color')->pluck('color') : [],
            'modelosCompatibles' => $tipo === 'componente'
                ? DB::table('modelos')
                    ->join('marcas', 'marcas.id', '=', 'modelos.marca_id')
                    ->selectRaw("modelos.id as id, (marcas.nombre || ' ' || modelos.nombre) as nombre")
                    ->orderBy('nombre')
                    ->get()
                : [],
        ]);
    }

    private function ponerExtras($productos)
    {
        $modelosIds = $productos
            ->where('tipo', 'modelo')
            ->pluck('id')
            ->unique()
            ->values()
            ->all();

        $colores = $this->ponerColores($modelosIds);

        return $productos->map(function ($producto) use ($colores) {
            if ($producto->tipo === 'modelo') {
                $producto->coloresDisponibles = $colores[$producto->id] ?? [];
            }
            if ($producto->tipo === 'componente') {
                $producto->modeloCompatible = $producto->modelo_compatible ?? null;
            }
            return $producto;
        });
    }
}
