# sistema-incidentes-tickets

Aplicación web simple para gestionar incidentes TIC. Está hecha solo con HTML, CSS y JavaScript, sin librerías ni servidor.

## Qué hace

- Registra incidentes con título, descripción, prioridad y responsable.
- Cada incidente tiene un estado: Abierto, En progreso, Resuelto o Cerrado.
- Prioridades: Baja, Media, Alta y Crítica.
- Responsables: Juan, Matías y Dalmiro.
- Mide el tiempo de resolución:
  - Al pasar a Resuelto o Cerrado se guarda la fecha y se muestra cuánto tardó.
  - Mientras está abierto, muestra el tiempo que lleva abierto.
  - Si se reabre, el tiempo vuelve a correr desde la creación.
- Muestra un resumen con la cantidad de incidentes por estado y el tiempo promedio de resolución.
- Permite filtrar por estado, prioridad y responsable.
- Permite eliminar incidentes. Antes de borrar pide confirmación.

## Cómo usarla

Abrí `index.html` en el navegador. No hace falta instalar nada.

Los datos se guardan en el `localStorage` del navegador. Eso quiere decir que quedan guardados al recargar la página, pero solo en ese navegador y en esa computadora.

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura de la página |
| `styles.css` | Estilos y colores por prioridad y estado |
| `app.js` | Lógica: guardar datos, registrar, editar, filtrar y calcular tiempos |
