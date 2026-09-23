// Listas fijas de la aplicación
const ESTADOS = ['Abierto', 'En progreso', 'Resuelto', 'Cerrado'];
const PRIORIDADES = ['Baja', 'Media', 'Alta', 'Crítica'];
const RESPONSABLES = ['Juan', 'Matías', 'Dalmiro'];
const CLAVE = 'incidentes';

// Elementos de la página
const form = document.getElementById('form-incidente');
const lista = document.getElementById('lista');
const vacio = document.getElementById('vacio');
const resumen = document.getElementById('resumen');
const filtros = document.getElementById('filtros');
const filtroEstado = document.getElementById('filtro-estado');
const filtroPrioridad = document.getElementById('filtro-prioridad');
const filtroResponsable = document.getElementById('filtro-responsable');

let incidentes = JSON.parse(localStorage.getItem(CLAVE)) || [];

function guardar() {
  localStorage.setItem(CLAVE, JSON.stringify(incidentes));
}

// Arma las <option> de un <select>
function opciones(valores, seleccionado) {
  return valores
    .map(v => `<option${v === seleccionado ? ' selected' : ''}>${v}</option>`)
    .join('');
}

// Evita que el texto del usuario se interprete como HTML
function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// Convierte milisegundos a texto: "2 d 3 h", "4 h 10 min" o "5 min"
function duracion(ms) {
  const minutos = Math.floor(ms / 60000);
  const d = Math.floor(minutos / 1440);
  const h = Math.floor((minutos % 1440) / 60);
  const m = minutos % 60;
  if (d > 0) return `${d} d ${h} h`;
  if (h > 0) return `${h} h ${m} min`;
  return `${m} min`;
}

function fecha(ms) {
  return new Date(ms).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

function tiempo(inc) {
  if (inc.resuelto) return `Resuelto en ${duracion(inc.resuelto - inc.creado)}`;
  return `Abierto hace ${duracion(Date.now() - inc.creado)}`;
}

function fila(inc) {
  return `
    <tr>
      <td>#${inc.id}</td>
      <td>
        <strong>${escapar(inc.titulo)}</strong>
        <small>${escapar(inc.descripcion)}</small>
      </td>
      <td>
        <select data-id="${inc.id}" data-campo="prioridad" data-prioridad="${inc.prioridad}">
          ${opciones(PRIORIDADES, inc.prioridad)}
        </select>
      </td>
      <td>
        <select data-id="${inc.id}" data-campo="responsable">
          ${opciones(RESPONSABLES, inc.responsable)}
        </select>
      </td>
      <td>
        <select data-id="${inc.id}" data-campo="estado" data-estado="${inc.estado}">
          ${opciones(ESTADOS, inc.estado)}
        </select>
      </td>
      <td>${fecha(inc.creado)}</td>
      <td>${tiempo(inc)}</td>
      <td><button type="button" class="eliminar" data-id="${inc.id}">Eliminar</button></td>
    </tr>`;
}

function mostrarResumen() {
  const tarjetas = ESTADOS.map(estado => {
    const cantidad = incidentes.filter(i => i.estado === estado).length;
    return `<div class="tarjeta"><span>${cantidad}</span>${estado}</div>`;
  });

  const resueltos = incidentes.filter(i => i.resuelto);
  const total = resueltos.reduce((suma, i) => suma + (i.resuelto - i.creado), 0);
  const promedio = resueltos.length ? duracion(total / resueltos.length) : '—';
  tarjetas.push(`<div class="tarjeta"><span>${promedio}</span>Tiempo promedio de resolución</div>`);

  resumen.innerHTML = tarjetas.join('');
}

function mostrar() {
  const visibles = incidentes
    .filter(i => !filtroEstado.value || i.estado === filtroEstado.value)
    .filter(i => !filtroPrioridad.value || i.prioridad === filtroPrioridad.value)
    .filter(i => !filtroResponsable.value || i.responsable === filtroResponsable.value)
    .reverse(); // los más nuevos primero

  lista.innerHTML = visibles.map(fila).join('');
  vacio.hidden = visibles.length > 0;
  mostrarResumen();
}

// Registrar un incidente nuevo
form.addEventListener('submit', e => {
  e.preventDefault();
  const titulo = form.titulo.value.trim();
  if (!titulo) return;

  incidentes.push({
    id: incidentes.reduce((max, i) => Math.max(max, i.id), 0) + 1,
    titulo,
    descripcion: form.descripcion.value.trim(),
    prioridad: form.prioridad.value,
    responsable: form.responsable.value,
    estado: 'Abierto',
    creado: Date.now(),
    resuelto: null,
  });

  guardar();
  form.reset();
  mostrar();
});

// Cambios de prioridad, responsable o estado desde la tabla
lista.addEventListener('change', e => {
  const { id, campo } = e.target.dataset;
  const inc = incidentes.find(i => i.id === Number(id));
  inc[campo] = e.target.value;

  // Al resolver o cerrar se guarda la fecha; si se reabre, se borra
  if (campo === 'estado') {
    const terminado = inc.estado === 'Resuelto' || inc.estado === 'Cerrado';
    inc.resuelto = terminado ? inc.resuelto || Date.now() : null;
  }

  guardar();
  mostrar();
});

// Eliminar un incidente
lista.addEventListener('click', e => {
  if (!e.target.matches('.eliminar')) return;
  if (!confirm('¿Eliminar este incidente?')) return;

  const id = Number(e.target.dataset.id);
  incidentes = incidentes.filter(i => i.id !== id);
  guardar();
  mostrar();
});

filtros.addEventListener('change', mostrar);

// Cargar las opciones de los <select>
form.prioridad.innerHTML = opciones(PRIORIDADES, 'Media');
form.responsable.innerHTML = opciones(RESPONSABLES);
filtroEstado.innerHTML = '<option value="">Todos</option>' + opciones(ESTADOS);
filtroPrioridad.innerHTML = '<option value="">Todas</option>' + opciones(PRIORIDADES);
filtroResponsable.innerHTML = '<option value="">Todos</option>' + opciones(RESPONSABLES);

// Actualizar los tiempos cada minuto
setInterval(mostrar, 60000);

mostrar();
