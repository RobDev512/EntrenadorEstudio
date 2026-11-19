import { montarMenuMaterias } from './menu-materias.js';
import { crearEjercicio } from './generador.js';
import { validarRespuesta, obtenerTraza } from './validadores.js';
import { crearPaquete, REPRESENTACIONES } from './codigo-unificado.js';
import { validarUnificado } from './validar-unificado.js';
import { analizarFilas } from './validar-representaciones.js';
import { guardarIntento, estadisticas, exportarProgreso, importarProgreso } from './progreso.js';
import { TallerNPI, referenciaCompletaNPI } from './npi-taller.js';

const $ = id => document.getElementById(id);
const botonesTabs = [...document.querySelectorAll('[data-representacion]')];
const ORDEN_ETAPAS = REPRESENTACIONES.map(item => item.id);
const NOMBRES_ETAPAS = Object.fromEntries(REPRESENTACIONES.map(item => [item.id, item.nombre]));
let paquete = null, ejercicio = null, representacion = 'npi';
const tallerNPI = new TallerNPI();
let pistasMostradas = 0, solucionVista = false;
let ejerciciosAbiertos = 0;
let borradores = {}, resultadosPorTab = {}, ayudasPorTab = {};
let trazaActiva = null, codigoTraza = '';
// Instantánea del Código P realmente aprobado; no se sustituye por la solución de referencia.
let codigoPAprobado = '';
let triplosAprobados = '';

function progresoGlobal() {
    const info = estadisticas();
    $('intentos').textContent = info.total;
    $('aciertos').textContent = info.correctos;
    $('xp').textContent = info.xp;
    $('racha').textContent = info.racha;
    $('porcentaje').textContent = `${info.porcentaje}%`;
    $('nombre-nivel').textContent = `Nivel ${info.nivel} · ${100 - info.xp % 100} XP para subir`;
    $('barra-relleno').style.width = `${info.porcentaje}%`;
    $('barra-aria').setAttribute('aria-valuenow', String(info.porcentaje));
    $('mensaje-motivacion').textContent = !info.total ? 'Tu primera práctica comienza aquí.' :
        info.porcentaje < 40 ? 'Revisa tus errores: ahí está la mejora.' :
        info.porcentaje < 80 ? 'Vas desarrollando consistencia.' : 'Buen dominio: prueba las cuatro representaciones.';
}
function etapaDesbloqueada(id) {
    const posicion = ORDEN_ETAPAS.indexOf(id);
    return posicion === 0 || (posicion > 0 && resultadosPorTab[ORDEN_ETAPAS[posicion - 1]]?.correcto === true);
}
function actualizarReferencias() {
    // Cada representación toma como guía la respuesta REAL aprobada inmediatamente antes:
    // triplos consulta Código P; cuádruplos consulta los triplos del estudiante.
    const mostrarCodigoP = representacion === 'triplos' && Boolean(codigoPAprobado);
    const mostrarTriplos = representacion === 'cuadruplos' && Boolean(triplosAprobados);
    $('fuente-fija-codigo-p').hidden = !mostrarCodigoP;
    $('fuente-fija-triplos').hidden = !mostrarTriplos;
    $('fuente-fija-detalle').classList.toggle('con-codigo-p', mostrarCodigoP);
    $('fuente-fija-detalle').classList.toggle('con-triplos', mostrarTriplos);
    $('fuente-fija-p-contenido').textContent = mostrarCodigoP ? codigoPAprobado : '';
    $('fuente-fija-triplos-contenido').textContent = mostrarTriplos ? triplosAprobados : '';
    // El código fuente permanece fijo y la referencia se puede compactar.
}
function actualizarContinuar() {
    const pos = ORDEN_ETAPAS.indexOf(representacion);
    const aprobado = resultadosPorTab[representacion]?.correcto === true;
    const ultimo = pos === ORDEN_ETAPAS.length - 1;
    const siguiente = ORDEN_ETAPAS[pos + 1];
    const boton = $('continuar');
    boton.disabled = !aprobado;
    boton.textContent = ultimo ? 'Terminar y crear otro ejercicio →' : `Continuar a ${NOMBRES_ETAPAS[siguiente]} →`;
    $('continuar-ayuda').textContent = aprobado
        ? (ultimo ? '¡Completaste las cuatro representaciones! Puedes comenzar otro ejercicio.' : `${NOMBRES_ETAPAS[siguiente]} ya está desbloqueado. Avanza sin volver a subir.`)
        : (ultimo ? 'Valida correctamente los cuádruplos para terminar.' : `Valida ${NOMBRES_ETAPAS[representacion]} para desbloquear ${NOMBRES_ETAPAS[siguiente]}.`);
}
function progresoPaquete() {
    const completadas = REPRESENTACIONES.filter(rep => resultadosPorTab[rep.id]?.correcto).length;
    $('texto-avance').textContent = `${completadas} de 4 representaciones completadas`;
    $('relleno-fuente').style.width = `${completadas * 25}%`;
    botonesTabs.forEach(boton => {
        const id = boton.dataset.representacion;
        const aprobada = resultadosPorTab[id]?.correcto === true;
        const bloqueada = !etapaDesbloqueada(id);
        boton.disabled = bloqueada;
        boton.classList.toggle('bloqueada', bloqueada);
        boton.querySelector('.completada').hidden = !aprobada;
        boton.querySelector('.candado')?.toggleAttribute('hidden', !bloqueada);
        const previo = ORDEN_ETAPAS[ORDEN_ETAPAS.indexOf(id) - 1];
        boton.title = bloqueada ? `Primero completa ${NOMBRES_ETAPAS[previo]}` : (aprobada ? 'Representación aprobada' : 'Lista para resolver');
        boton.setAttribute('aria-label', `${NOMBRES_ETAPAS[id]}${bloqueada ? `, bloqueada hasta completar ${NOMBRES_ETAPAS[previo]}` : aprobada ? ', aprobada' : ', disponible'}`);
    });
    actualizarContinuar();
}
function feedback(correcto, titulo, detalle) {
    const contenedor = $('feedback');
    contenedor.hidden = false;
    contenedor.className = `feedback ${correcto ? 'bien' : 'mal'}`;
    $('feedback-titulo').textContent = titulo;
    $('feedback-detalle').textContent = detalle;
    contenedor.classList.remove('entrada-feedback');
    void contenedor.offsetWidth;
    contenedor.classList.add('entrada-feedback');
}
function esTabla() { return ejercicio?.editor === 'tabla'; }
function numerarFilas() {
    [...$('tabla-cuerpo').rows].forEach((fila, i) => {
        fila.querySelector('.indice-tabla').textContent = ejercicio.tipo === 'triplos' ? `(${i})` : String(i);
        fila.querySelectorAll('input').forEach((input, col) => input.setAttribute('aria-label', `${ejercicio.columnas[col]} de fila ${i}`));
    });
}
function agregarFila(valores = []) {
    const cuerpo = $('tabla-cuerpo');
    if (cuerpo.rows.length >= 48) return;
    const tr = document.createElement('tr');
    const indice = document.createElement('td'); indice.className = 'indice-tabla'; tr.append(indice);
    ejercicio.columnas.forEach((columna, i) => {
        const td = document.createElement('td'), input = document.createElement('input');
        input.className = 'entrada-celda'; input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
        input.placeholder = i === 0 ? '+' : i === 3 ? 't1' : i === 1 ? 'a' : 'b';
        input.value = valores[i] ?? ''; input.setAttribute('aria-label', columna);
        td.append(input); tr.append(td);
    });
    const tdBorrar = document.createElement('td'), quitar = document.createElement('button');
    quitar.className = 'quitar-fila'; quitar.type = 'button'; quitar.textContent = '×';
    quitar.title = 'Eliminar esta fila'; quitar.setAttribute('aria-label', 'Eliminar fila');
    quitar.addEventListener('click', () => {
        if (cuerpo.rows.length === 1) tr.querySelectorAll('input').forEach(input => input.value = '');
        else tr.remove();
        numerarFilas();
    });
    tdBorrar.append(quitar); tr.append(tdBorrar); cuerpo.append(tr); numerarFilas();
}
function prepararTabla(valor = '') {
    $('tabla-cuerpo').replaceChildren(); $('tabla-encabezado').replaceChildren();
    for (const nombre of ['N.º', ...ejercicio.columnas, '']) {
        const th = document.createElement('th'); th.textContent = nombre; $('tabla-encabezado').append(th);
    }
    if (typeof valor === 'object' && Array.isArray(valor.filas)) {
        valor.filas.forEach(campos => agregarFila(campos));
    } else if (typeof valor === 'string' && valor.trim()) {
        try { analizarFilas(valor, ejercicio.columnas.length).forEach(fila => agregarFila(fila.campos)); }
        catch { /* El texto de referencia fue incorrecto. */ }
    }
    const minimo = paquete.fuente.tipo === 'aritmetica' ? 7 : 14;
    while ($('tabla-cuerpo').rows.length < minimo) agregarFila();
}
function respuestaActual() {
    if (!esTabla()) return $('respuesta').value.trim();
    const filas = [...$('tabla-cuerpo').rows];
    return filas.map((fila, i) => {
        const campos = [...fila.querySelectorAll('input')].map(input => input.value.trim());
        if (campos.every(v => !v)) return '';
        return `${ejercicio.tipo === 'triplos' ? `(${i})` : i}: (${campos.join(', ')})`;
    }).filter(Boolean).join('\n');
}
function guardarBorrador() {
    if (!ejercicio) return;
    if (representacion === 'npi') { ayudasPorTab.npi = { pistasMostradas, solucionVista }; return; }
    borradores[representacion] = esTabla() ? { filas: [...$('tabla-cuerpo').rows].map(fila => [...fila.querySelectorAll('input')].map(input => input.value)) } : respuestaActual();
    ayudasPorTab[representacion] = { pistasMostradas, solucionVista };
}
function reiniciarPaneles() {
    $('feedback').hidden = true; $('pista-panel').hidden = true; $('solucion-panel').hidden = true;
    $('solucion').textContent = 'Ver solución';
}
function cambiarRepresentacion(id, guardar = true) {
    if (!paquete || !etapaDesbloqueada(id)) return false;
    if (guardar) guardarBorrador();
    representacion = id; ejercicio = paquete.versiones[id];
    const ayuda = ayudasPorTab[id] ?? { pistasMostradas: 0, solucionVista: false };
    pistasMostradas = ayuda.pistasMostradas; solucionVista = ayuda.solucionVista;
    botonesTabs.forEach(boton => {
        const activa = boton.dataset.representacion === id;
        boton.classList.toggle('activa', activa); boton.setAttribute('aria-selected', String(activa));
        boton.tabIndex = activa ? 0 : -1;
    });
    $('codigo-solucion').textContent = id === 'npi' ? referenciaCompletaNPI(ejercicio.etapas) : ejercicio.referencia;
    $('editor-npi').hidden = id !== 'npi';
    $('editor-texto').hidden = esTabla() || id === 'npi'; $('editor-tabla').hidden = !esTabla();
    $('editor-texto').classList.toggle('edicion-codigo', id === 'codigoP');
    $('titulo-editor').textContent = ({ codigoP: 'Tu traducción a Código P', npi: 'Árbol completo → postorden con comas → NPI',
        triplos: 'Tu tabla de triplos', cuadruplos: 'Tu tabla de cuádruplos' })[id];
    $('titulo-editor').htmlFor = esTabla() || id === 'npi' ? '' : 'respuesta';
    $('respuesta').placeholder = id === 'npi' ? 'ASIGNACION: C a b + a b - * =' : 'LOD a\nLOD b\nADD\n...';
    $('respuesta').classList.toggle('npi-entrada', id === 'npi');
    $('atajo').textContent = id === 'npi' ? 'Árboles independientes · 3 pasos por árbol' : 'Ctrl + Enter: validar';
    $('consejo-editor').textContent = id === 'codigoP'
        ? 'Compara la pila paso a paso con los valores iniciales. JT salta si la condición es verdadera.'
        : id === 'npi' ? 'Cada expresión o condición tiene un árbol. En asignaciones incluye = como raíz y variable destino a la izquierda. Postorden separado por comas; NPI por espacios.'
        : id === 'triplos' ? 'Usa referencias (0), (1)... Los controles requieren condiciones, JT, GOTO y LABEL.'
        : 'Usa temporales t1, t2... Para saltos, etiquetas y asignaciones deja — donde corresponda.';
    $('contexto-representacion').textContent = id === 'npi' && paquete.fuente.tipo !== 'aritmetica'
        ? 'Un árbol independiente por expresión o condición del programa. Todos aparecen en tarjetas; selecciona cuál editar. NPI aquí no representa los saltos de control.'
        : id === 'npi' ? 'El árbol de una asignación incluye destino y =. Su postorden se escribe con comas; la NPI es la misma secuencia, separada por espacios.'
        : id === 'codigoP' ? 'Escribe las instrucciones y practica a su derecha los estados de la pila con los valores proporcionados.'
        : id === 'triplos' ? 'Trabajas sobre el MISMO código fuente. Tu Código P aprobado permanece visible como referencia.'
        : 'Trabajas sobre el MISMO código fuente. Tus triplos aprobados permanecen visibles para preparar los cuádruplos.';
    if (id === 'npi') tallerNPI.mostrar();
    else if (esTabla()) prepararTabla(borradores[id] || '');
    else $('respuesta').value = borradores[id] || '';
    reiniciarPaneles();
    const previo = resultadosPorTab[id];
    if (previo) feedback(previo.correcto, previo.titulo, previo.detalle);
    actualizarReferencias();
    actualizarContinuar();
    return true;
}
function cargarEjercicio() {
    const tipo = $('tipo').value;
    // Solo se generan fuentes, no se elige una representación como ejercicio independiente.
    const fuente = crearEjercicio(tipo);
    paquete = crearPaquete(fuente);
    ejerciciosAbiertos++;
    $('numero-ejercicio').textContent = `#${ejerciciosAbiertos}`;
    $('titulo-ejercicio').textContent = fuente.nombre;
    $('dificultad').textContent = fuente.dificultad;
    $('enunciado').textContent = 'Resuelve TODOS los árboles del código fuente, cada uno con su postorden y NPI; después realiza Código P, triplos y cuádruplos.';
    $('expresion').textContent = fuente.expresion;
    $('valores').textContent = Object.entries(fuente.entradaVisible).map(([k,v]) => `${k} = ${v}`).join('   ·   ');
    // La misma fuente se consulta en un panel sticky incluso al resolver abajo.
    $('fuente-fija-tipo').textContent = fuente.nombre;
    $('fuente-fija-codigo').textContent = fuente.expresion;
    $('fuente-fija-variables').textContent = $('valores').textContent;
    $('fuente-fija-resumen').textContent = `${fuente.expresion.replace(/\s+/g, ' ').trim()}   ·   ${$('valores').textContent}`;
    borradores = {}; resultadosPorTab = {}; ayudasPorTab = {}; trazaActiva = null; codigoTraza = ''; codigoPAprobado = ''; triplosAprobados = '';
    $('filas-pila').replaceChildren(); $('estado-pila').textContent = 'Pulsa «Preparar comprobación» cuando tengas tu Código P.';
    $('verificar-pila').disabled = true; $('revelar-pila').disabled = true;
    tallerNPI.cargar(paquete.versiones.npi.etapas);
    cambiarRepresentacion('npi', false);
    progresoPaquete();
    const tarjeta = $('tarjeta-ejercicio');
    tarjeta.classList.remove('entrada-ejercicio'); void tarjeta.offsetWidth; tarjeta.classList.add('entrada-ejercicio');
}
function celebrar() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const capa = $('celebracion'); capa.replaceChildren();
    const colores = ['#40d6f1','#46dfaa','#ffc266','#91a5ff'];
    for (let i=0;i<12;i++) {
        const punto = document.createElement('span'); punto.className = 'particula';
        punto.style.setProperty('--dx',`${(Math.random()-.5)*440}px`);
        punto.style.setProperty('--dy',`${-100-Math.random()*260}px`);
        punto.style.setProperty('--rot',`${Math.random()*360}deg`);
        punto.style.backgroundColor = colores[i%colores.length]; capa.append(punto);
    }
    capa.addEventListener('animationend', e => { if (e.target.classList.contains('particula')) e.target.remove(); }, { once: true });
}
function validar() {
    if (resultadosPorTab[representacion]?.correcto) {
        feedback(true, 'Representación completada', 'Esta representación ya fue aprobada. Puedes seguir con otra pestaña.'); return;
    }
    if (representacion === 'npi' && !tallerNPI.terminado()) {
        feedback(false, 'NPI todavía incompleta', tallerNPI.pendiente()); return;
    }
    const respuesta = representacion === 'npi' ? tallerNPI.textoParaValidar() : respuestaActual();
    if (!respuesta.trim()) { feedback(false, 'Respuesta vacía', 'Completa esta representación antes de validar.'); return; }
    const resultado = representacion === 'codigoP' ? validarRespuesta(respuesta, ejercicio) : validarUnificado(respuesta, ejercicio);
    resultadosPorTab[representacion] = resultado;
    feedback(resultado.correcto, resultado.titulo, resultado.detalle);
    const guardado = guardarIntento(`${paquete.fuente.tipo}:${representacion}`, resultado, { pistas: pistasMostradas, solucionVista });
    if (!guardado) $('mensaje-progreso').textContent = 'El navegador impidió guardar el progreso local.';
    progresoGlobal(); progresoPaquete();
    if (resultado.correcto) {
        if (representacion === 'codigoP') codigoPAprobado = respuesta;
        if (representacion === 'triplos') triplosAprobados = respuesta;
        celebrar();
    }
}
function darPista() {
    const pistas = ejercicio.pistas;
    pistasMostradas = Math.min(pistasMostradas+1, pistas.length);
    $('pista-panel').hidden = false;
    $('pista-numero').textContent = `${pistasMostradas} de ${pistas.length}`;
    $('pista-texto').textContent = pistas[pistasMostradas-1];
}
function alternarSolucion() {
    $('solucion-panel').hidden = !$('solucion-panel').hidden;
    if (!$('solucion-panel').hidden) solucionVista = true;
    $('solucion').textContent = $('solucion-panel').hidden ? 'Ver solución' : 'Ocultar solución';
}
function usarSolucion() {
    solucionVista = true;
    if (representacion === 'npi') { tallerNPI.ponerSolucion(); return; }
    if (!esTabla()) { $('respuesta').value = ejercicio.referencia; $('respuesta').focus(); return; }
    try { prepararTabla(ejercicio.referencia); $('tabla-cuerpo').querySelector('input')?.focus(); }
    catch (error) { feedback(false, 'No se pudo copiar', error.message); }
}
function limpiar() {
    if (representacion === 'npi') tallerNPI.limpiarEtapa();
    else if (esTabla()) prepararTabla(); else { $('respuesta').value = ''; $('respuesta').focus(); }
    reiniciarPaneles();
    borradores[representacion] = '';
    if (representacion === 'codigoP') {
        trazaActiva = null; codigoTraza = ''; $('filas-pila').replaceChildren();
        $('verificar-pila').disabled = true; $('revelar-pila').disabled = true;
        $('estado-pila').textContent = 'Se limpió la comprobación. Prepara las filas cuando escribas el programa.';
    }
}
const formatoPila = pila => `[${pila.join(', ')}]`;
function prepararComprobacion() {
    const texto = $('respuesta').value.trim();
    if (!texto) { $('estado-pila').textContent = 'Escribe primero el Código P.'; return; }
    $('filas-pila').replaceChildren(); trazaActiva = null;
    $('verificar-pila').disabled = true; $('revelar-pila').disabled = true;
    try {
        // Toma las líneas ejecutadas en el orden REAL: un ciclo puede repetir instrucciones.
        const traza = obtenerTraza(texto, ejercicio);
        trazaActiva = traza; codigoTraza = texto;
        for (const [i, paso] of traza.entries()) {
            const tr = document.createElement('tr');
            const tdN = document.createElement('td'); tdN.textContent = String(i+1);
            const tdCodigo = document.createElement('td'); tdCodigo.textContent = paso.instruccion;
            const tdEntrada = document.createElement('td'), input = document.createElement('input');
            input.type = 'text'; input.className = 'entrada-pila'; input.autocomplete = 'off';
            input.placeholder = '[] o 8,3'; input.setAttribute('aria-label', `Estado de pila después de paso ${i+1}: ${paso.instruccion}`);
            tdEntrada.append(input);
            const tdResultado = document.createElement('td'); const marca = document.createElement('span');
            marca.className = 'marca-resultado'; tdResultado.append(marca);
            tr.append(tdN, tdCodigo, tdEntrada, tdResultado); $('filas-pila').append(tr);
        }
        $('verificar-pila').disabled = false; $('revelar-pila').disabled = false;
        $('estado-pila').textContent = `${traza.length} pasos ejecutados. Rellena «Mi pila» con los valores después de cada instrucción. Escribe [] si está vacía.`;
        if (traza.length >= 180) $('estado-pila').textContent += ' Se muestran como máximo 180 pasos.';
    } catch (error) { $('estado-pila').textContent = `No se pudo preparar: ${error.message}`; }
}
function convertirPila(valor) {
    let s = valor.trim();
    if (!s) throw new Error('Falta escribir el estado. Para pila vacía escribe [].');
    if (s === '[]') return [];
    if (s.startsWith('[') && s.endsWith(']')) s = s.slice(1,-1).trim();
    if (!s) return [];
    const partes = s.includes(',') ? s.split(',') : s.split(/\s+/);
    if (partes.some(p => !/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(p.trim()))) throw new Error('Escribe números separados por comas, por ejemplo [8, 3].');
    return partes.map(Number);
}
function revisarComprobacion(revelar = false) {
    if (!trazaActiva) return;
    if ($('respuesta').value.trim() !== codigoTraza) { $('estado-pila').textContent = 'Cambiaste el Código P. Pulsa «Preparar comprobación» de nuevo.'; return; }
    let correctos = 0;
    const filas = [...$('filas-pila').rows];
    filas.forEach((fila, i) => {
        const input = fila.querySelector('input'), marca = fila.querySelector('.marca-resultado');
        const esperado = trazaActiva[i].pila;
        let correcto = false, error = '';
        if (revelar) { input.value = formatoPila(esperado); correcto = true; }
        else {
            try { const dado = convertirPila(input.value);
                correcto = dado.length === esperado.length && dado.every((valor,j) => Number.isFinite(valor) && Math.abs(valor-esperado[j]) <= 1e-8 * Math.max(1,Math.abs(valor),Math.abs(esperado[j])));
            } catch (ex) { error = ex.message; }
        }
        if (correcto) correctos++;
        input.classList.toggle('correcta', correcto); input.classList.toggle('incorrecta', !correcto);
        marca.className = `marca-resultado ${correcto ? 'ok' : 'error'}`;
        if (correcto) {
            const antes = i ? trazaActiva[i-1].variables : paquete.fuente.inicializar(paquete.fuente.entradaVisible);
            const despues = trazaActiva[i].variables;
            const cambios = Object.keys(despues).filter(k => antes[k] !== despues[k]).map(k => `${k}=${despues[k]}`);
            marca.textContent = `✓${cambios.length ? ` · ${cambios.join(', ')}` : ''}`;
        } else marca.textContent = error ? `✕ ${error}` : `✕ Esperado ${formatoPila(esperado)}`;
    });
    if (revelar) {
        solucionVista = true;
        $('estado-pila').textContent = `Se revelaron los ${filas.length} estados. Revisa especialmente SUB, DIV, STO y los saltos JT/JMP.`;
    } else $('estado-pila').textContent = `${correctos} de ${filas.length} estados correctos. Las filas con ✕ muestran qué valor debía quedar en la pila.`;
    if (correctos === filas.length && !revelar) celebrar();
}
function descargar(texto, nombre) {
    const url = URL.createObjectURL(new Blob([texto], { type:'application/json;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = nombre; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// El usuario puede compactar la referencia; el código no desaparece por
// completo porque el renglón-resumen siempre queda visible.
$('fuente-fija-toggle').addEventListener('click', () => {
    const panel = $('fuente-fija');
    const compacto = panel.classList.toggle('compacto');
    $('fuente-fija-toggle').setAttribute('aria-expanded', String(!compacto));
    $('fuente-fija-toggle').innerHTML = compacto ? 'Expandir <span aria-hidden="true">⌄</span>' : 'Compactar <span aria-hidden="true">⌃</span>';
    $('fuente-fija-detalle').hidden = compacto;
    $('fuente-fija-resumen').hidden = !compacto;
});

$('tipo').addEventListener('change', cargarEjercicio);
$('nuevo').addEventListener('click', cargarEjercicio);
for (const boton of botonesTabs) boton.addEventListener('click', () => cambiarRepresentacion(boton.dataset.representacion));
$('continuar').addEventListener('click', () => {
    if (!resultadosPorTab[representacion]?.correcto) return;
    const pos = ORDEN_ETAPAS.indexOf(representacion);
    if (pos === ORDEN_ETAPAS.length - 1) cargarEjercicio();
    else cambiarRepresentacion(ORDEN_ETAPAS[pos + 1]);
    // No hace falta volver al selector de ejercicios: llevar el editor a la zona visible
    // situada justo debajo del panel de referencia fija.
    requestAnimationFrame(() => {
        const seccion = document.querySelector('.representaciones');
        const margen = $('fuente-fija').getBoundingClientRect().height + 18;
        const distancia = window.scrollY + seccion.getBoundingClientRect().top - margen;
        const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: Math.max(0, distancia), behavior: suave ? 'smooth' : 'instant' });
    });
});
$('validar').addEventListener('click', validar);
$('pista').addEventListener('click', darPista);
$('solucion').addEventListener('click', alternarSolucion);
$('limpiar').addEventListener('click', limpiar);
$('usar-solucion').addEventListener('click', usarSolucion);
$('agregar-fila').addEventListener('click', () => { for(let i=0;i<5;i++) agregarFila(); $('tabla-cuerpo').lastElementChild?.querySelector('input')?.focus(); });
$('agregar-fila').textContent = '+ Agregar 5 filas';
$('preparar-pila').addEventListener('click', prepararComprobacion);
$('verificar-pila').addEventListener('click', () => revisarComprobacion(false));
$('revelar-pila').addEventListener('click', () => revisarComprobacion(true));
$('respuesta').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); validar(); }
    if (e.key === 'Tab') { e.preventDefault(); e.target.setRangeText('    ', e.target.selectionStart, e.target.selectionEnd, 'end'); }
});
$('editor-tabla').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); validar(); }
});
$('exportar').addEventListener('click', () => {
    descargar(exportarProgreso(), 'Etriva_progreso.json');
    $('mensaje-progreso').textContent = 'Progreso exportado a JSON.';
});
$('importar').addEventListener('change', async e => {
    const archivo = e.target.files?.[0]; if (!archivo) return;
    try { importarProgreso(await archivo.text()); progresoGlobal(); $('mensaje-progreso').textContent = 'Progreso importado correctamente.'; }
    catch (error) { $('mensaje-progreso').textContent = `No se pudo importar: ${error.message}`; }
    e.target.value = '';
});

progresoGlobal(); cargarEjercicio();

montarMenuMaterias();
