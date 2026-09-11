/**
 * data-seed.js
 * Datos iniciales del proyecto "Prácticas digitales, brechas informativas e
 * intervención en alfabetización digital en salud de personas adultas mayores"
 * (UAS-CA-347, Facultad de Biología, UAS). Vigencia 2026-2028.
 *
 * Este archivo se usa de dos maneras:
 * 1. Como respaldo local (localStorage) si aún no se ha conectado el backend
 *    de Google Sheets, para que la app funcione desde el primer momento.
 * 2. Como base para poblar el Google Sheet la primera vez (ver
 *    apps-script/Code.gs -> función seedSheet()).
 */

const PROJECT_MESES = [
  { id: 1, label: "Ago", ym: "2026-08" },
  { id: 2, label: "Sep", ym: "2026-09" },
  { id: 3, label: "Oct", ym: "2026-10" },
  { id: 4, label: "Nov", ym: "2026-11" },
  { id: 5, label: "Dic", ym: "2026-12" },
  { id: 6, label: "Ene", ym: "2027-01" },
  { id: 7, label: "Feb", ym: "2027-02" },
  { id: 8, label: "Mar", ym: "2027-03" },
  { id: 9, label: "Abr", ym: "2027-04" },
  { id: 10, label: "May", ym: "2027-05" },
  { id: 11, label: "Jun", ym: "2027-06" },
  { id: 12, label: "Jul", ym: "2027-07" },
];

const PROJECT_INFO = {
  nombre: "Prácticas digitales, brechas informativas e intervención en alfabetización digital en salud de personas adultas mayores",
  ur: "Facultad de Biología, Universidad Autónoma de Sinaloa",
  cuerpo_academico: "UAS-CA-347 · Investigación e Innovación en Ciencias Biológicas y Salud",
  responsable: "M.C. Adriana Alicia Barrios Rodríguez",
  correo: "abarrios@uas.edu.mx",
  vigencia: "2026-2028",
  tipo: "Intervención",
  ambito: "Urbano (Culiacán, Sinaloa)",
};

const OBJETIVOS = [
  { id: "A", texto: "Analizar las prácticas digitales y las dinámicas de interacción con información en salud en comunidades digitales vinculadas al envejecimiento, mediante observación netnográfica sistemática." },
  { id: "B", texto: "Caracterizar y medir las brechas informativas en salud en personas adultas mayores de Culiacán, Sinaloa, a través de la recolección y análisis de datos cuantitativos que permitan establecer una línea de base." },
  { id: "C", texto: "Diseñar estrategias y materiales educativos y de divulgación en salud, pertinentes y accesibles, orientados al fortalecimiento de habilidades de alfabetización digital en la población objetivo." },
  { id: "D", texto: "Implementar la intervención educativa y de divulgación mediante acciones formativas (talleres, recursos digitales y actividades participativas) dirigidas a personas adultas mayores." },
  { id: "E", texto: "Evaluar el impacto y los resultados de la intervención mediante la integración y análisis de datos cualitativos y cuantitativos, considerando cambios en conocimientos, habilidades y uso de información en salud." },
];

// mes_inicio / mes_fin usan el id de PROJECT_MESES (1 = Ago 2026 ... 12 = Jul 2027)
const METAS = [
  { id: "M1", objetivo: "A", color: "#3B6FA0", mes_inicio: 1, mes_fin: 2,
    texto: "Analizar un conjunto diverso de comunidades digitales relacionadas con salud y envejecimiento mediante netnografía multi-sitio (primeros 2 meses)." },
  { id: "M2", objetivo: "B", color: "#B5588F", mes_inicio: 2, mes_fin: 4,
    texto: "Aplicar un instrumento a un mínimo de 50 personas adultas mayores de Culiacán (2 a 3 meses) para cuantificar brechas informativas como línea de base." },
  { id: "M3", objetivo: "C", color: "#C97A3D", mes_inicio: 4, mes_fin: 5,
    texto: "Desarrollar un portafolio de al menos 5 materiales educativos y de divulgación en salud (meses 4 y 5)." },
  { id: "M4", objetivo: "D", color: "#5E8C5A", mes_inicio: 6, mes_fin: 10,
    texto: "Implementar al menos 2 talleres o sesiones educativas (meses 6 al 10)." },
  { id: "M5", objetivo: "D", color: "#7856A8", mes_inicio: 6, mes_fin: 10,
    texto: "Implementar de 4 a 6 acciones formativas adicionales (talleres, materiales, actividades participativas) (meses 6 al 10)." },
  { id: "M6", objetivo: "E", color: "#2E6B6B", mes_inicio: 10, mes_fin: 12,
    texto: "Aplicar instrumentos de evaluación al 100% de los participantes (meses 10 al 12)." },
  { id: "M7", objetivo: "E", color: "#C9A227", mes_inicio: 11, mes_fin: 12,
    texto: "Elaborar informe final, un producto académico y uno de divulgación (cierre del proyecto)." },
];

// estado inicial de toda actividad: "pendiente" | "en_curso" | "completada"
const ACTIVIDADES = [
  // Meta 1
  { meta: "M1", texto: "Identificar plataformas y comunidades digitales relevantes (redes sociales, foros, blogs)." },
  { meta: "M1", texto: "Definir criterios de selección y diseñar matriz de análisis." },
  { meta: "M1", texto: "Realizar observación sistemática de contenidos, interacciones y actores." },
  { meta: "M1", texto: "Clasificar tipos de contenido y prácticas digitales." },
  { meta: "M1", texto: "Sistematizar hallazgos en categorías analíticas." },
  // Meta 2
  { meta: "M2", texto: "Elaborar y validar el instrumento de recolección de datos." },
  { meta: "M2", texto: "Diseñar la muestra y definir criterios de inclusión." },
  { meta: "M2", texto: "Gestionar acceso a la población (centros comunitarios o unidades de salud)." },
  { meta: "M2", texto: "Aplicar el instrumento." },
  { meta: "M2", texto: "Capturar y analizar los datos obtenidos." },
  // Meta 3
  { meta: "M3", texto: "Definir contenidos prioritarios con base en el diagnóstico." },
  { meta: "M3", texto: "Seleccionar formatos de materiales (infografías, videos, guías)." },
  { meta: "M3", texto: "Diseñar prototipos de materiales educativos." },
  { meta: "M3", texto: "Validar materiales con usuarios (prueba piloto)." },
  { meta: "M3", texto: "Ajustar y compilar el portafolio final." },
  // Meta 4
  { meta: "M4", texto: "Diseñar las sesiones educativas y guías didácticas." },
  { meta: "M4", texto: "Elaborar materiales de apoyo para los talleres." },
  { meta: "M4", texto: "Coordinar logística, sedes y convocatoria de participantes." },
  { meta: "M4", texto: "Ejecutar los talleres o sesiones educativas." },
  { meta: "M4", texto: "Registrar asistencia y participación." },
  // Meta 5
  { meta: "M5", texto: "Aplicar materiales educativos en sesiones formativas." },
  { meta: "M5", texto: "Desarrollar actividades participativas (dinámicas, ejercicios)." },
  { meta: "M5", texto: "Acompañar a los participantes en el uso de recursos digitales." },
  { meta: "M5", texto: "Brindar orientación personalizada durante las actividades." },
  { meta: "M5", texto: "Documentar el proceso mediante registros y evidencias." },
  // Meta 6
  { meta: "M6", texto: "Diseñar instrumentos de evaluación (cuestionarios o guías)." },
  { meta: "M6", texto: "Aplicar evaluaciones posteriores a la intervención." },
  { meta: "M6", texto: "Recopilar información sobre cambios en conocimientos y habilidades." },
  { meta: "M6", texto: "Analizar los resultados obtenidos." },
  { meta: "M6", texto: "Integrar resultados cualitativos y cuantitativos." },
  // Meta 7
  { meta: "M7", texto: "Sistematizar resultados de la intervención." },
  { meta: "M7", texto: "Elaborar el informe técnico final." },
  { meta: "M7", texto: "Redactar producto académico (artículo o reporte)." },
  { meta: "M7", texto: "Desarrollar producto de divulgación (material o contenido)." },
  { meta: "M7", texto: "Difundir resultados en espacios académicos o comunitarios." },
].map((a, i) => ({
  id: "ACT-" + String(i + 1).padStart(3, "0"),
  meta: a.meta,
  descripcion: a.texto,
  estado: "pendiente",
  responsable: "",
  evidencia_url: "",
  notas: "",
}));

// Exponer en window para uso desde app.js (sin módulos, compatible con file:// y GitHub Pages)
window.SEED = { PROJECT_INFO, PROJECT_MESES, OBJETIVOS, METAS, ACTIVIDADES };
