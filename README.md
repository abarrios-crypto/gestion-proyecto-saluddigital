# Alfabetización Digital en Salud — App de gestión del proyecto (UAS-CA-347)

PWA para llevar el seguimiento del proyecto *"Prácticas digitales, brechas
informativas e intervención en alfabetización digital en salud de personas
adultas mayores"*: cronograma visual, checklist de actividades, bitácora de
notas y generación de reportes de avance.

## Arquitectura

```
Google Doc  ──▶  Apps Script (generarProyecto)  ──▶  Google Sheet (se crea solo)
 (fuente de           │
  verdad editable)     └───────▶  doGet/doPost (API REST)  ◀────▶  PWA (GitHub Pages)
```

El **Doc** es donde escribes/editas el proyecto en un formato simple. El
**script** lo lee y genera/actualiza el **Sheet** automáticamente (no lo
creas tú a mano). Ese mismo script sirve la información a la **PWA** por
internet.

---

## Paso 1 — Crear el Google Doc con la información del proyecto

1. Ve a [docs.new](https://docs.new) para crear un documento en blanco.
2. Abre el archivo **`plantilla-proyecto.txt`** (incluido aquí) — ya trae
   los datos reales de tu proyecto (objetivos, metas, actividades) en un
   formato de líneas simple.
3. Copia todo su contenido y pégalo en el Google Doc.
4. Puedes editarlo libremente después: corregir un texto, agregar una
   actividad (copia una línea `M4: ...` y cámbiale el texto), mover los
   números de mes de una meta, etc. Mientras respetes el formato de cada
   línea, el script lo va a leer bien.
5. Copia el **ID del documento** de la URL:
   `https://docs.google.com/document/d/`**`ESTE_ES_EL_ID`**`/edit`

## Paso 2 — Crear el script que genera el Sheet automáticamente

1. Ve a [script.google.com](https://script.google.com) → **Nuevo proyecto**.
2. Borra el contenido de `Code.gs` que aparece por defecto.
3. Pega todo el contenido de **`apps-script/Code.gs`** (incluido aquí).
4. Al inicio del archivo, reemplaza:
   ```js
   const DOC_ID = "PEGA_AQUI_EL_ID_DE_TU_GOOGLE_DOC";
   const APP_TOKEN = "elige-un-token-secreto-y-cambialo-aqui";
   ```
   con el ID que copiaste y una palabra secreta que tú elijas (esto evita
   que cualquiera con la URL pueda leer o editar tus datos).
5. En la barra de funciones (arriba del editor), elige **`generarProyecto`**
   y pulsa **▶ Ejecutar**.
   - La primera vez te pedirá autorizar permisos: es tu script actuando
     sobre tus propios archivos de Drive, es seguro aceptar.
   - Ve a **Ver → Registros de ejecución**: ahí aparece el enlace directo
     al Google Sheet recién creado, ya lleno con los objetivos, metas y
     actividades.

Cada vez que edites el Doc y quieras refrescar el Sheet, vuelve a
ejecutar `generarProyecto`. El estado, responsable y notas que ya hayas
capturado en el Sheet **no se pierden** — el script solo actualiza los
textos y agrega lo nuevo.

## Paso 3 — Publicar el script como API (para que la PWA lo use)

1. En el mismo proyecto de Apps Script: **Implementar → Nueva
   implementación**.
2. Tipo: **Aplicación web**.
3. Ejecutar como: **Yo**. Quién tiene acceso: **Cualquier usuario**.
4. **Implementar** y copia la URL que termina en `/exec`.

Si más adelante modificas el script, recuerda crear una **nueva versión**
de la implementación (Implementar → Gestionar implementaciones → ✏️ →
Nueva versión) para que los cambios se reflejen en esa misma URL.

## Paso 4 — Publicar la PWA en GitHub Pages

1. Crea un repositorio en GitHub y sube el contenido de esta carpeta
   (`index.html`, `css/`, `js/`, `manifest.json`, `service-worker.js`,
   `icons/`) a la raíz.
2. **Settings → Pages** → elige la rama/carpeta donde quedaron los
   archivos.
3. Abre la URL que GitHub te asigna.

## Paso 5 — Conectar la PWA con tu Sheet

1. En la app, pestaña **Ajustes**.
2. Pega la URL `/exec` del Paso 3 y el mismo `APP_TOKEN` que elegiste.
3. **Guardar y conectar**. El indicador de la barra lateral debe cambiar
   a "Conectado al Sheet".

Desde ahí, cualquier cambio de estado, nota o reporte que hagas en la app
se guarda también en tu Google Sheet, y puedes compartir la misma URL de
la app con más personas del equipo.

---

## El formato de la plantilla, explicado

```
PROYECTO: <nombre del proyecto>
RESPONSABLE: <nombre>
CORREO: <correo>
VIGENCIA: <años>

OBJETIVO GENERAL:
<texto libre, puede ocupar varias líneas>

OBJETIVOS ESPECIFICOS:
A) <texto>
B) <texto>
...

METAS:
M1 | <objetivo: A-E> | <mes_inicio 1-12> | <mes_fin 1-12> | <texto>
M2 | ...

ACTIVIDADES:
M1: <actividad>
M1: <otra actividad>
M2: <actividad>
...
```

- Los meses van del **1 al 12**, donde 1 = primer mes del proyecto
  (agosto 2026) y 12 = último (julio 2027). Ajusta estos números en el
  Doc si el cronograma cambia.
- Puedes agregar una meta `M8` o quitar actividades: el script las
  detecta automáticamente la próxima vez que ejecutes `generarProyecto`.
- Si borras una línea `M3: <actividad>` del Doc y vuelves a generar, esa
  actividad desaparecerá del Sheet (y de la app) — haz una copia de
  respaldo del Sheet si te preocupa perder algún estado ya capturado.

---

## Qué incluye la app

- **Panel**: avance global (%), conteo de actividades por estado,
  vista miniatura del cronograma.
- **Cronograma**: representación tipo Gantt de las metas del proyecto
  sobre los 12 meses de vigencia. Clic en una meta filtra sus
  actividades.
- **Actividades**: checklist con estado (pendiente / en curso /
  completada), campo de responsable y buscador.
- **Bitácora / Notas**: registro de campo con fecha automática, autor y
  etiqueta libre.
- **Reportes**: genera un resumen de texto (avance global y por meta,
  últimas notas), descargable en `.md` o guardable en la pestaña
  `Reportes` del Sheet, con historial dentro de la app.
- **Ajustes**: configurar/probar la conexión al backend, y botón para
  restablecer los datos locales de ejemplo.

## Modo offline

El *service worker* cachea el "app shell" (HTML/CSS/JS/manifest/iconos),
así que la app abre sin conexión. Los datos se guardan en `localStorage`
y se sincronizan con el Sheet cada vez que hay red.

## Estructura de archivos

```
pwa-app/
├── index.html
├── manifest.json
├── service-worker.js
├── plantilla-proyecto.txt     # pega esto en tu Google Doc (Paso 1)
├── css/
│   └── style.css
├── js/
│   ├── app.js          # lógica de la SPA
│   └── data-seed.js    # datos de ejemplo para el modo sin conexión
├── icons/
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
└── apps-script/
    └── Code.gs          # pega esto en script.google.com (Paso 2)
```

## Extender la app (ideas)

- Autenticación real (Google Identity Services) en vez del token
  compartido.
- Adjuntar evidencias (fotos, PDFs) subiéndolas a Drive desde Apps
  Script y guardando el link en `evidencia_url`.
- Exportar el reporte generado directamente a un Google Doc con la
  Docs API.
- Gráfica de avance histórico usando los reportes guardados.
