# ReportaBarrio

<<<<<<< HEAD
**Integrantes:** Johandrys Benitez Y Vanessa Rodriguez
=======
## Descripción
Plataforma ciudadana para reportar, consultar y filtrar problemas del barrio (huecos, basuras, alumbrado, fugas de agua, espacio público y seguridad vial). Los datos viven en un arreglo en memoria, sin base de datos.

## ODS elegido
**ODS 11: Ciudades y comunidades sostenibles** (metas 11.1, 11.3 y 11.6).

## Instalación y ejecución
```bash
npm install
npm run dev     # con nodemon
# o: npm start
```
Abrir http://localhost:3000

## Rutas del servidor
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Inicio (estático) |
| GET | `/reportar.html` | Formulario de reporte (estático) |
| GET | `/reportes` | Listado; filtros `?categoria=...&barrio=...` |
| POST | `/reportes` | Valida (400 si falta algo), guarda y redirige a `/reportes` |
| GET | `/estadisticas` | Conteo por categoría y por estado |
| * | cualquier otra | Página 404 |

Categorías (valor): `vias`, `alumbrado`, `residuos`, `agua`, `espacio`, `seguridad-vial`.
## Repositorio
https://github.com/johandrys/reportabarrio

## Video de sustentación
(https://youtu.be/BP6Xy1t6cQw?si=OLVT7mAikjbAr5E_)
