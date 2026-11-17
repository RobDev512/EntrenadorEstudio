/* Se conserva la clave v1: los datos guardados desde v0.2.0 siguen siendo compatibles. */
const CLAVE = 'entrenador-estudio-progreso-v1';
const VACIO = () => ({ version: 1, registros: [] });

export function leerProgreso() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE));
        if (datos?.version === 1 && Array.isArray(datos.registros)) return datos;
    } catch { /* almacenamiento bloqueado o datos inválidos */ }
    return VACIO();
}

export function guardarIntento(tipo, resultado, contexto = {}) {
    const datos = leerProgreso();
    datos.registros.push({
        fecha: new Date().toISOString(), tipo, correcto: !!resultado.correcto,
        pistas: Math.max(0, Math.min(3, Number(contexto.pistas) || 0)),
        solucionVista: !!contexto.solucionVista
    });
    if (datos.registros.length > 3000) datos.registros = datos.registros.slice(-3000);
    try { localStorage.setItem(CLAVE, JSON.stringify(datos)); return true; }
    catch { return false; }
}

function diaLocal(valor) {
    const fecha = new Date(valor);
    if (!Number.isFinite(fecha.getTime())) return '';
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}
function contarRacha(registros) {
    const dias = new Set(registros.map(r => diaLocal(r.fecha)).filter(Boolean));
    const actual = new Date();
    const hoy = diaLocal(actual);
    if (!dias.has(hoy)) { actual.setDate(actual.getDate() - 1); if (!dias.has(diaLocal(actual))) return 0; }
    let racha = 0;
    while (dias.has(diaLocal(actual))) { racha++; actual.setDate(actual.getDate() - 1); }
    return racha;
}
export function estadisticas() {
    const registros = leerProgreso().registros;
    const correctos = registros.filter(r => r.correcto).length;
    const xp = registros.reduce((suma, r) => suma + (r.correcto ? (r.solucionVista ? 2 : (r.pistas > 0 ? 7 : 12)) : 2), 0);
    return {
        total: registros.length, correctos,
        porcentaje: registros.length ? Math.round(100 * correctos / registros.length) : 0,
        xp, nivel: Math.floor(xp / 100) + 1, racha: contarRacha(registros)
    };
}
export function exportarProgreso() { return JSON.stringify(leerProgreso(), null, 2); }
export function importarProgreso(texto) {
    const datos = JSON.parse(texto);
    if (datos?.version !== 1 || !Array.isArray(datos.registros) || datos.registros.length > 3000 ||
        !datos.registros.every(r => typeof r.fecha === 'string' && Number.isFinite(Date.parse(r.fecha)) && typeof r.tipo === 'string' && typeof r.correcto === 'boolean' &&
            (r.pistas === undefined || (Number.isInteger(r.pistas) && r.pistas >= 0 && r.pistas <= 3)) &&
            (r.solucionVista === undefined || typeof r.solucionVista === 'boolean'))) {
        throw new Error('El archivo no contiene un progreso compatible.');
    }
    localStorage.setItem(CLAVE, JSON.stringify({ version: 1, registros: datos.registros }));
}
