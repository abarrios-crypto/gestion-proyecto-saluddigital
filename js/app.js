/**
 * app.js — lógica de la PWA de gestión del proyecto.
 * Sin frameworks: DOM + fetch. Funciona offline con datos locales y se
 * sincroniza con un Google Sheet a través de un backend de Apps Script.
 */

const LS_CONFIG = "pwa_config";
const LS_CACHE = "pwa_cache";

/**
 * Configuración por defecto del equipo: así nadie tiene que pegar la URL
 * ni el token manualmente — la app ya viene conectada al Sheet del
 * proyecto. Reemplaza estos dos valores por los tuyos antes de publicar
 * en GitHub Pages. Cualquier persona puede seguir sobreescribiéndolos
 * desde Ajustes (por ejemplo, para apuntar a un Sheet de pruebas), y esa
 * elección personal queda guardada solo en su navegador.
 */
const DEFAULT_CONFIG = {
  apiUrl: "https://script.google.com/macros/s/AKfycbwy8aHNNEytuL-afW2RmljyknzIxM5Dogm6iP5MIT-dwPfVqRfYUetENrBLuJkFC5S05Q/exec",
  apiToken: "100888",
};

let STORE = { objetivos: [], metas: [], actividades: [], notas: [], reportes: [] };
let CONFIG = { apiUrl: "", apiToken: "" };

const LS_USER = "pwa_user_name";
const LS_READONLY = "pwa_readonly";

function getUserName() { return localStorage.getItem(LS_USER) || ""; }
function setUserName(name) { localStorage.setItem(LS_USER, name.trim()); }
function isReadOnly() { return localStorage.getItem(LS_READONLY) === "1"; }
function setReadOnly(val) { localStorage.setItem(LS_READONLY, val ? "1" : "0"); }

/* ---------------- Configuración y arranque ---------------- */

function loadConfig() {
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem(LS_CONFIG)); } catch (e) {}
  const tieneDefault = DEFAULT_CONFIG.apiUrl && DEFAULT_CONFIG.apiUrl.indexOf("PEGA_AQUI") === -1;
  CONFIG = stored || (tieneDefault ? { ...DEFAULT_CONFIG } : { apiUrl: "", apiToken: "" });
  document.getElementById("apiUrl").value = CONFIG.apiUrl || "";
  document.getElementById("apiToken").value = CONFIG.apiToken || "";
  document.getElementById("userName").value = getUserName();
  document.getElementById("readOnlyToggle").checked = isReadOnly();
}

function saveConfig(apiUrl, apiToken) {
  CONFIG = { apiUrl: apiUrl.trim(), apiToken: apiToken.trim() };
  localStorage.setItem(LS_CONFIG, JSON.stringify(CONFIG));
}

function loadLocalData() {
  const cached = localStorage.getItem(LS_CACHE);
  if (cached) {
    STORE = JSON.parse(cached);
    return;
  }
  // primera vez: usar semilla de datos del proyecto
  const s = window.SEED;
  STORE = {
    objetivos: s.OBJETIVOS,
    metas: s.METAS,
    actividades: s.ACTIVIDADES,
    notas: [],
    reportes: [],
  };
  persistLocal();
}

function persistLocal() {
  localStorage.setItem(LS_CACHE, JSON.stringify(STORE));
}

/* ---------------- Capa de API (Apps Script) ---------------- */

async function apiGetAll() {
  if (!CONFIG.apiUrl) throw new Error("Sin URL configurada");
  const url = CONFIG.apiUrl + "?action=all&token=" + encodeURIComponent(CONFIG.apiToken || "");
  const res = await fetch(url);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Error de API");
  return json.data;
}

// Content-Type text/plain evita el preflight CORS que Apps Script no responde.
async function apiPost(action, sheet, id, payload) {
  if (!CONFIG.apiUrl) throw new Error("Sin URL configurada");
  const body = JSON.stringify({ token: CONFIG.apiToken || "", action, sheet, id, payload });
  const res = await fetch(CONFIG.apiUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Error de API");
  return json.data;
}

async function sync() {
  setConnStatus("conectando");
  try {
    const data = await apiGetAll();
    STORE.objetivos = data.Objetivos.length ? data.Objetivos : STORE.objetivos;
    STORE.metas = data.Metas.length ? data.Metas.map(normalizeMeta) : STORE.metas;
    STORE.actividades = data.Actividades.length ? data.Actividades : STORE.actividades;
    STORE.notas = data.Notas || [];
    STORE.reportes = data.Reportes || [];
    persistLocal();
    setConnStatus("online");
    renderAll();
  } catch (err) {
    console.warn("Sync falló, usando datos locales:", err.message);
    setConnStatus("offline");
  }
}

function normalizeMeta(m) {
  return { ...m, mes_inicio: Number(m.mes_inicio), mes_fin: Number(m.mes_fin) };
}

function setConnStatus(state) {
  const el = document.getElementById("connStatus");
  const text = document.getElementById("connText");
  el.className = "status" + (state === "online" ? " online" : "");
  text.textContent =
    state === "online" ? "Conectado al Sheet" :
    state === "conectando" ? "Sincronizando…" :
    CONFIG.apiUrl ? "Sin conexión (usando caché)" : "Modo local (sin Sheet)";
}

/* ---------------- Navegación entre vistas ---------------- */

function setupNav() {
  document.querySelectorAll("nav.views button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("nav.views button").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("view-" + btn.dataset.view).classList.add("active");
    });
  });
}

/* ---------------- Utilidades ---------------- */

function metaById(id) { return STORE.metas.find(m => m.id === id); }
function objetivoById(id) { return STORE.objetivos.find(o => o.id === id); }

function computeStats() {
  const total = STORE.actividades.length;
  const completadas = STORE.actividades.filter(a => a.estado === "completada").length;
  const enCurso = STORE.actividades.filter(a => a.estado === "en_curso").length;
  const pendientes = total - completadas - enCurso;
  const avance = total ? Math.round((completadas / total) * 100) : 0;
  return { total, completadas, enCurso, pendientes, avance };
}

function mesLabel(id) {
  const m = window.SEED.PROJECT_MESES.find(x => x.id === id);
  return m ? m.label : id;
}

/* ---------------- Render: Panel ---------------- */

function renderPanel() {
  const stats = computeStats();
  const grid = document.getElementById("statGrid");
  grid.innerHTML = `
    <div class="stat-card accent-azul">
      <div class="num">${stats.avance}%</div>
      <div class="label">Avance global</div>
      <div class="progress-bar"><span style="width:${stats.avance}%"></span></div>
    </div>
    <div class="stat-card accent-verde">
      <div class="num">${stats.completadas}</div>
      <div class="label">Actividades completadas</div>
    </div>
    <div class="stat-card accent-azul">
      <div class="num">${stats.enCurso}</div>
      <div class="label">En curso</div>
    </div>
    <div class="stat-card accent-alerta">
      <div class="num">${stats.pendientes}</div>
      <div class="label">Pendientes</div>
    </div>
    <div class="stat-card accent-dorado">
      <div class="num">${STORE.metas.length}</div>
      <div class="label">Metas totales</div>
    </div>
  `;
  document.getElementById("panelMiniGantt").innerHTML = buildGanttHtml(true);
}

/* ---------------- Render: Cronograma (Gantt) ---------------- */

function buildGanttHtml(compact) {
  const meses = window.SEED.PROJECT_MESES;
  const monthsHeader = `
    <div class="gantt-months">
      <div></div>
      <div class="track">${meses.map(m => `<span>${m.label}</span>`).join("")}</div>
    </div>`;

  const rows = STORE.metas.map(m => {
    const left = ((m.mes_inicio - 1) / 12) * 100;
    const width = ((m.mes_fin - m.mes_inicio + 1) / 12) * 100;
    return `
      <div class="gantt-row">
        <div class="meta-label" data-meta="${m.id}">
          <span class="id">${m.id} · Obj. ${m.objetivo}</span>
          ${compact ? "" : escapeHtml(m.texto)}
        </div>
        <div class="gantt-track">
          <div class="gantt-bar" data-meta="${m.id}" style="left:${left}%; width:${width}%; background:${m.color};" title="${escapeHtml(m.texto)}"></div>
        </div>
      </div>`;
  }).join("");

  return `<div class="gantt">${monthsHeader}${rows}</div>`;
}

function renderCronograma() {
  document.getElementById("ganttFull").innerHTML = buildGanttHtml(false);
  document.querySelectorAll("#ganttFull .meta-label, #ganttFull .gantt-bar").forEach(el => {
    el.addEventListener("click", () => {
      document.getElementById("filterMeta").value = el.dataset.meta;
      document.querySelector('nav.views button[data-view="actividades"]').click();
      renderActividades();
    });
  });
}

/* ---------------- Render: Actividades ---------------- */

function populateMetaFilter() {
  const sel = document.getElementById("filterMeta");
  const current = sel.value;
  sel.innerHTML = '<option value="">Todas las metas</option>' +
    STORE.metas.map(m => `<option value="${m.id}">${m.id} · Obj. ${m.objetivo}</option>`).join("");
  sel.value = current;
}

function renderActividades() {
  populateMetaFilter();
  const metaFilter = document.getElementById("filterMeta").value;
  const estadoFilter = document.getElementById("filterEstado").value;
  const textoFilter = document.getElementById("filterTexto").value.toLowerCase();

  const list = STORE.actividades.filter(a => {
    if (metaFilter && a.meta !== metaFilter) return false;
    if (estadoFilter && a.estado !== estadoFilter) return false;
    if (textoFilter && !a.descripcion.toLowerCase().includes(textoFilter)) return false;
    return true;
  });

  const el = document.getElementById("actList");
  if (!list.length) {
    el.innerHTML = `<p class="hint">No hay actividades que coincidan con el filtro.</p>`;
    return;
  }

  el.innerHTML = list.map(a => {
    const meta = metaById(a.meta);
    const ro = isReadOnly();
    return `
    <div class="act-item" style="border-left-color:${meta ? meta.color : "var(--azul)"}" data-id="${a.id}">
      <div>
        <div class="id">${a.id}</div>
        <span class="badge ${a.estado}">${estadoLabel(a.estado)}</span>
      </div>
      <div>
        <div class="desc">${escapeHtml(a.descripcion)}</div>
        <div class="meta-tag">${meta ? meta.id + " · Objetivo " + meta.objetivo : a.meta}${a.actualizado_por ? " · últ. edición: " + escapeHtml(a.actualizado_por) : ""}</div>
        <input class="responsable-input" data-field="responsable" placeholder="Responsable" value="${escapeAttr(a.responsable || "")}" ${ro ? "disabled" : ""} />
      </div>
      <div>
        <select class="estado" data-field="estado" ${ro ? "disabled" : ""}>
          <option value="pendiente" ${a.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
          <option value="en_curso" ${a.estado === "en_curso" ? "selected" : ""}>En curso</option>
          <option value="completada" ${a.estado === "completada" ? "selected" : ""}>Completada</option>
        </select>
      </div>
    </div>`;
  }).join("");

  if (isReadOnly()) return; // no engancha eventos de edición en modo revisión

  el.querySelectorAll(".act-item").forEach(item => {
    const id = item.dataset.id;
    item.querySelector('[data-field="estado"]').addEventListener("change", e => updateActividad(id, { estado: e.target.value }));
    item.querySelector('[data-field="responsable"]').addEventListener("change", e => updateActividad(id, { responsable: e.target.value }));
  });
}

async function updateActividad(id, payload) {
  const act = STORE.actividades.find(a => a.id === id);
  if (!act) return;
  payload.actualizado_por = getUserName() || "Sin nombre";
  Object.assign(act, payload);
  persistLocal();
  renderPanel();
  try { await apiPost("update", "Actividades", id, act); } catch (e) { console.warn("No se pudo sincronizar:", e.message); }
}

/* ---------------- Render: Notas ---------------- */

function applyReadOnlyUI() {
  const ro = isReadOnly();
  ["notaContenido", "notaAutor", "notaEtiqueta", "btnAddNota"].forEach(id => {
    document.getElementById(id).disabled = ro;
  });
  const banner = document.getElementById("readOnlyBanner");
  if (banner) banner.style.display = ro ? "block" : "none";
}

function renderNotas() {
  const el = document.getElementById("notaList");
  const ordenadas = [...STORE.notas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  if (!ordenadas.length) {
    el.innerHTML = `<p class="hint">Aún no hay notas registradas.</p>`;
    return;
  }
  el.innerHTML = ordenadas.map(n => `
    <div class="nota-item">
      <div class="meta">${new Date(n.fecha).toLocaleString("es-MX")} · ${escapeHtml(n.autor || "Anónimo")} ${n.etiqueta ? "· " + escapeHtml(n.etiqueta) : ""}</div>
      <div>${escapeHtml(n.contenido)}</div>
    </div>`).join("");
}

async function addNota() {
  if (isReadOnly()) return;
  const contenido = document.getElementById("notaContenido").value.trim();
  if (!contenido) return;
  const nota = {
    id: "N-" + Date.now(),
    fecha: new Date().toISOString(),
    autor: getUserName() || document.getElementById("notaAutor").value.trim(),
    contenido,
    etiqueta: document.getElementById("notaEtiqueta").value.trim(),
  };
  STORE.notas.push(nota);
  persistLocal();
  document.getElementById("notaContenido").value = "";
  document.getElementById("notaEtiqueta").value = "";
  renderNotas();
  try { await apiPost("create", "Notas", nota.id, nota); } catch (e) { console.warn("No se pudo sincronizar la nota:", e.message); }
}

/* ---------------- Render: Reportes ---------------- */

function generarReporteTexto() {
  const stats = computeStats();
  const fecha = new Date().toLocaleString("es-MX");
  let txt = `REPORTE DE AVANCE\n`;
  txt += `Proyecto: ${window.SEED.PROJECT_INFO.nombre}\n`;
  txt += `Responsable: ${window.SEED.PROJECT_INFO.responsable}\n`;
  txt += `Generado: ${fecha}\n`;
  txt += `${"-".repeat(60)}\n`;
  txt += `Avance global: ${stats.avance}%  (${stats.completadas}/${stats.total} actividades completadas)\n`;
  txt += `En curso: ${stats.enCurso} · Pendientes: ${stats.pendientes}\n\n`;
  txt += `AVANCE POR META\n`;
  STORE.metas.forEach(m => {
    const acts = STORE.actividades.filter(a => a.meta === m.id);
    const done = acts.filter(a => a.estado === "completada").length;
    const pct = acts.length ? Math.round((done / acts.length) * 100) : 0;
    txt += `  ${m.id} (${mesLabel(m.mes_inicio)}-${mesLabel(m.mes_fin)}) · ${pct}% — ${m.texto}\n`;
  });
  if (STORE.notas.length) {
    txt += `\nÚLTIMAS NOTAS\n`;
    [...STORE.notas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5).forEach(n => {
      txt += `  [${new Date(n.fecha).toLocaleDateString("es-MX")}] ${n.contenido}\n`;
    });
  }
  return txt;
}

let ultimoReporte = "";

function renderReportHistory() {
  const el = document.getElementById("reportHistory");
  if (!STORE.reportes.length) { el.innerHTML = `<p class="hint">Sin reportes guardados aún.</p>`; return; }
  el.innerHTML = [...STORE.reportes].reverse().map(r => `
    <div class="nota-item">
      <div class="meta">${new Date(r.fecha).toLocaleString("es-MX")} · ${r.avance_pct}% de avance</div>
      <div>${escapeHtml((r.resumen || "").slice(0, 160))}…</div>
    </div>`).join("");
}

/* ---------------- Helpers de escape ---------------- */

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[s]));
}
function escapeAttr(str) { return escapeHtml(str); }
function estadoLabel(e) { return e === "completada" ? "Completada" : e === "en_curso" ? "En curso" : "Pendiente"; }

/* ---------------- Render global ---------------- */

function renderAll() {
  applyReadOnlyUI();
  renderPanel();
  renderCronograma();
  renderActividades();
  renderNotas();
  renderReportHistory();
}

/* ---------------- Eventos ---------------- */

function setupEvents() {
  document.getElementById("btnSync").addEventListener("click", sync);

  document.getElementById("filterMeta").addEventListener("change", renderActividades);
  document.getElementById("filterEstado").addEventListener("change", renderActividades);
  document.getElementById("filterTexto").addEventListener("input", renderActividades);

  document.getElementById("btnAddNota").addEventListener("click", addNota);

  document.getElementById("btnGenReport").addEventListener("click", () => {
    ultimoReporte = generarReporteTexto();
    document.getElementById("reportBox").textContent = ultimoReporte;
  });

  document.getElementById("btnDownloadReport").addEventListener("click", () => {
    if (!ultimoReporte) return;
    const blob = new Blob([ultimoReporte], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "reporte-" + new Date().toISOString().slice(0, 10) + ".md";
    a.click();
  });

  document.getElementById("btnSaveReport").addEventListener("click", async () => {
    if (!ultimoReporte) ultimoReporte = generarReporteTexto();
    const stats = computeStats();
    const reporte = {
      id: "R-" + Date.now(),
      fecha: new Date().toISOString(),
      periodo: new Date().toLocaleDateString("es-MX"),
      avance_pct: stats.avance,
      resumen: ultimoReporte,
      generado_por: "",
    };
    STORE.reportes.push(reporte);
    persistLocal();
    renderReportHistory();
    try { await apiPost("create", "Reportes", reporte.id, reporte); } catch (e) { console.warn("No se pudo guardar el reporte remoto:", e.message); }
  });

  document.getElementById("settingsForm").addEventListener("submit", e => {
    e.preventDefault();
    saveConfig(document.getElementById("apiUrl").value, document.getElementById("apiToken").value);
    setUserName(document.getElementById("userName").value);
    setReadOnly(document.getElementById("readOnlyToggle").checked);
    applyReadOnlyUI();
    renderActividades();
    document.getElementById("settingsMsg").textContent = "Configuración guardada. Sincronizando…";
    sync();
  });

  document.getElementById("btnTestConn").addEventListener("click", async () => {
    saveConfig(document.getElementById("apiUrl").value, document.getElementById("apiToken").value);
    const msg = document.getElementById("settingsMsg");
    msg.textContent = "Probando…";
    try {
      await apiGetAll();
      msg.textContent = "✔ Conexión exitosa.";
    } catch (e) {
      msg.textContent = "✘ No se pudo conectar: " + e.message;
    }
  });

  document.getElementById("btnReset").addEventListener("click", () => {
    if (!confirm("Esto borrará los datos guardados en este navegador (no afecta el Sheet). ¿Continuar?")) return;
    localStorage.removeItem(LS_CACHE);
    loadLocalData();
    renderAll();
  });
}

/* ---------------- Arranque ---------------- */

function init() {
  loadConfig();
  loadLocalData();
  setupNav();
  setupEvents();
  setConnStatus(CONFIG.apiUrl ? "offline" : "local");
  renderAll();
  if (CONFIG.apiUrl) sync();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(err => console.warn("SW error:", err));
  }
}

document.addEventListener("DOMContentLoaded", init);
