// ReportaBarrio · Servidor Express (rutas y lógica)
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ---------- Middlewares ----------
app.use(express.static(path.join(__dirname, 'public'))); // archivos estáticos
app.use(express.urlencoded({ extended: true }));         // lee req.body de formularios

// ---------- Datos fijos ----------
const CATEGORIAS = {
  vias: 'Vías y huecos',
  alumbrado: 'Alumbrado público',
  residuos: 'Residuos y basuras',
  agua: 'Agua y alcantarillado',
  espacio: 'Espacio público y zonas verdes',
  'seguridad-vial': 'Seguridad vial'
};
const BARRIOS = ['Centro', 'El Prado', 'Boston', 'Ciudad Jardín', 'Rebolo', 'Barrio Abajo', 'Riomar'];
const URGENCIAS = ['baja', 'media', 'alta'];
const ESTADOS = ['Pendiente', 'En proceso', 'Resuelto'];
const ETIQUETAS = {
  titulo: 'Título', categoria: 'Categoría', barrio: 'Barrio',
  descripcion: 'Descripción', urgencia: 'Urgencia', contacto: 'Contacto'
};

// ---------- "Base de datos" en memoria ----------
const reportes = [
  { id: 1, titulo: 'Hueco grande frente al colegio', categoria: 'vias', barrio: 'Centro',
    descripcion: 'Hueco de más de un metro que obliga a los carros a invadir el carril contrario.',
    urgencia: 'alta', contacto: 'vecino1@correo.com', fecha: '2026-11-02', estado: 'En proceso' },
  { id: 2, titulo: 'Tres postes sin luz en la cuadra', categoria: 'alumbrado', barrio: 'El Prado',
    descripcion: 'Desde hace dos semanas la cuadra queda a oscuras y ha habido hurtos.',
    urgencia: 'alta', contacto: '3001234567', fecha: '2026-11-05', estado: 'Pendiente' },
  { id: 3, titulo: 'Basura acumulada en la esquina', categoria: 'residuos', barrio: 'Centro',
    descripcion: 'El carro recolector no pasa y las bolsas se están rompiendo en la calle.',
    urgencia: 'media', contacto: 'junta@correo.com', fecha: '2026-11-08', estado: 'Pendiente' },
  { id: 4, titulo: 'Fuga de agua en el andén', categoria: 'agua', barrio: 'Boston',
    descripcion: 'Sale agua limpia constantemente desde hace tres días.',
    urgencia: 'media', contacto: '3109876543', fecha: '2026-11-10', estado: 'Resuelto' },
  { id: 5, titulo: 'Parque sin mantenimiento', categoria: 'espacio', barrio: 'Ciudad Jardín',
    descripcion: 'El pasto está muy alto y los juegos infantiles están oxidados.',
    urgencia: 'baja', contacto: 'parque@correo.com', fecha: '2026-11-12', estado: 'Pendiente' }
];
let siguienteId = reportes.length + 1;

// ---------- Utilidades ----------
const esc = (t) => String(t).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fechaLegible = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
const claseEstado = (e) => 'estado-' + e.toLowerCase().replace(' ', '-');

// Plantilla común (mismo encabezado y pie que las páginas estáticas)
function layout(titulo, contenido, activo) {
  const link = (href, texto, id) =>
    `<li><a href="${href}"${id === activo ? ' class="activo" aria-current="page"' : ''}>${texto}</a></li>`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(titulo)} · ReportaBarrio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Figtree:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/estilos.css">
</head>
<body>
  <header class="encabezado">
    <a class="logo" href="/"><span class="logo-marca" aria-hidden="true">!</span>ReportaBarrio</a>
    <nav aria-label="Principal">
      <ul class="menu">
        ${link('/', 'Inicio', 'inicio')}${link('/reportar.html', 'Reportar', 'reportar')}${link('/reportes', 'Reportes', 'reportes')}${link('/estadisticas', 'Estadísticas', 'estadisticas')}
      </ul>
    </nav>
  </header>
  <main class="contenedor">
${contenido}
  </main>
  <footer class="pie"><p>ReportaBarrio · Proyecto de aula de Tecnologías Web · ODS 11: Ciudades y comunidades sostenibles</p></footer>
</body>
</html>`;
}

// ---------- Rutas ----------
// GET /reportes -> listado con filtros (req.query)
app.get('/reportes', (req, res) => {
  const categoria = String(req.query.categoria || '').trim();
  const barrio = String(req.query.barrio || '').trim();

  const lista = reportes.filter((r) =>
    (!categoria || r.categoria === categoria) &&
    (!barrio || r.barrio.toLowerCase() === barrio.toLowerCase()));

  const opcionesCat = Object.entries(CATEGORIAS).map(([k, v]) =>
    `<option value="${k}"${k === categoria ? ' selected' : ''}>${v}</option>`).join('');
  const opcionesBarrio = BARRIOS.map((b) =>
    `<option value="${b}"${b.toLowerCase() === barrio.toLowerCase() ? ' selected' : ''}>${b}</option>`).join('');

  const tarjetas = lista.map((r) => `
      <article class="tarjeta urgencia-${r.urgencia}">
        <div class="tarjeta-tope">
          <span class="cat-fila"><img src="/img/${r.categoria}.svg" alt="" width="40" height="40"><span class="etiqueta">${CATEGORIAS[r.categoria]}</span></span>
          <span class="estado ${claseEstado(r.estado)}">${r.estado}</span>
        </div>
        <h3>${esc(r.titulo)}</h3>
        <p>${esc(r.descripcion)}</p>
        <dl class="datos">
          <div><dt>Barrio</dt><dd>${esc(r.barrio)}</dd></div>
          <div><dt>Urgencia</dt><dd>${r.urgencia}</dd></div>
          <div><dt>Fecha</dt><dd>${fechaLegible(r.fecha)}</dd></div>
        </dl>
      </article>`).join('');

  const vacio = `
      <div class="vacio">
        <p><strong>No hay reportes con esos filtros.</strong></p>
        <p>Prueba con otra categoría o barrio, o <a href="/reportar.html">crea el primer reporte</a>.</p>
      </div>`;

  res.send(layout('Reportes', `
    <section class="seccion">
      <h1>Reportes del barrio</h1>
      <p class="intro">${lista.length} ${lista.length === 1 ? 'reporte' : 'reportes'} encontrados.</p>
      <form class="filtros" action="/reportes" method="GET">
        <label>Categoría
          <select name="categoria"><option value="">Todas</option>${opcionesCat}</select>
        </label>
        <label>Barrio
          <select name="barrio"><option value="">Todos</option>${opcionesBarrio}</select>
        </label>
        <button type="submit" class="boton">Filtrar</button>
        <a class="boton boton-claro" href="/reportes">Limpiar</a>
      </form>
      <div class="tarjetas">${lista.length ? tarjetas : vacio}</div>
    </section>`, 'reportes'));
});

// POST /reportes -> valida (400) y guarda; si todo va bien redirige
app.post('/reportes', (req, res) => {
  const campos = Object.keys(ETIQUETAS);
  const d = {};
  campos.forEach((c) => { d[c] = String(req.body[c] || '').trim(); });

  const errores = campos.filter((c) => !d[c]).map((c) => `Falta el campo obligatorio: ${ETIQUETAS[c]}.`);
  if (d.categoria && !CATEGORIAS[d.categoria]) errores.push('La categoría elegida no existe.');
  if (d.urgencia && !URGENCIAS.includes(d.urgencia)) errores.push('La urgencia debe ser baja, media o alta.');
  if (d.contacto && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.contacto) && !/^[0-9+\s()-]{7,}$/.test(d.contacto)) {
    errores.push('El contacto debe ser un correo o un teléfono válido.');
  }

  if (errores.length) {
    return res.status(400).send(layout('Revisa el reporte', `
    <section class="seccion mensaje mensaje-error">
      <h1>No pudimos guardar tu reporte</h1>
      <ul>${errores.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>
      <p><a class="boton" href="/reportar.html">Volver al formulario</a></p>
    </section>`, 'reportar'));
  }

  reportes.unshift({ id: siguienteId++, ...d, fecha: new Date().toISOString().slice(0, 10), estado: 'Pendiente' });
  res.redirect('/reportes');
});

// GET /estadisticas -> conteo por categoría y por estado
app.get('/estadisticas', (req, res) => {
  const total = reportes.length;
  const barra = (nombre, n, clase = '', icono = '') => `
        <li class="fila-barra">
          <span class="fila-nombre">${icono ? `<img src="/img/${icono}.svg" alt="" width="28" height="28">` : ''}${nombre}</span>
          <span class="barra"><span class="barra-relleno ${clase}" style="width:${total ? (n / total) * 100 : 0}%"></span></span>
          <strong class="fila-valor">${n}</strong>
        </li>`;

  const porCat = Object.entries(CATEGORIAS).map(([k, v]) =>
    barra(v, reportes.filter((r) => r.categoria === k).length, '', k)).join('');
  const porEstado = ESTADOS.map((e) =>
    barra(e, reportes.filter((r) => r.estado === e).length, claseEstado(e))).join('');

  res.send(layout('Estadísticas', `
    <section class="seccion">
      <h1>Estadísticas</h1>
      <p class="intro">Así va el seguimiento de los problemas del barrio (ODS 11, metas 11.1, 11.3 y 11.6).</p>
      <div class="resumen">
        <div class="dato-grande"><strong>${total}</strong><span>reportes en total</span></div>
        <div class="dato-grande"><strong>${reportes.filter((r) => r.estado === 'Pendiente').length}</strong><span>pendientes</span></div>
        <div class="dato-grande"><strong>${reportes.filter((r) => r.estado === 'Resuelto').length}</strong><span>resueltos</span></div>
      </div>
      <div class="dos-columnas">
        <article class="panel"><h2>Por categoría</h2><ul class="barras">${porCat}</ul></article>
        <article class="panel"><h2>Por estado</h2><ul class="barras">${porEstado}</ul></article>
      </div>
    </section>`, 'estadisticas'));
});

// 404 para cualquier ruta inexistente (siempre al final)
app.use((req, res) => {
  res.status(404).send(layout('Página no encontrada', `
    <section class="seccion mensaje">
      <h1>404 · Esta calle no existe</h1>
      <p>No encontramos <code>${esc(req.path)}</code>. Vuelve al inicio o consulta los reportes.</p>
      <p><a class="boton" href="/">Ir al inicio</a></p>
    </section>`, ''));
});

app.listen(PORT, () => console.log(`ReportaBarrio listo en http://localhost:${PORT}`));
