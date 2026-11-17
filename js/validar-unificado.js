/* Un mismo programa fuente -> NPI por expresiones, Código P, triplos y cuádruplos.
   No evalúa JavaScript escrito por el estudiante: interpreta un lenguaje reducido.
   En los controles, NPI representa cada expresión/condición por separado, no los saltos. */
import { analizarFilas } from './validar-representaciones.js';

const NUM = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/;
const ID = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const REF = /^\((\d+)\)$/;
const VACIO = /^(?:—|–|-|_)$/;
const OPS = new Set(['+', '-', '*', '/', '>', '>=', '<', '<=']);
const iguales = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-8 * Math.max(1, Math.abs(a), Math.abs(b));
const falla = texto => { throw new Error(texto); };
const listado = datos => Object.entries(datos).map(([k,v]) => `${k}=${v}`).join(', ');
function aplicar(op, a, b, donde) {
    if (!Number.isFinite(a) || !Number.isFinite(b)) falla(`${donde}: hay un operando sin valor.`);
    if (op === '/' && Math.abs(b) < 1e-12) falla(`${donde}: división entre cero.`);
    const valor = ({ '+': () => a + b, '-': () => a - b, '*': () => a * b, '/': () => a / b,
        '>': () => +(a > b), '>=': () => +(a >= b), '<': () => +(a < b), '<=': () => +(a <= b) })[op]?.();
    if (!Number.isFinite(valor)) falla(`${donde}: operación «${op}» inválida.`);
    return valor;
}
function leerValor(token, vars, resultados = null, donde = 'Expresión') {
    if (NUM.test(token)) return Number(token);
    const match = token.match(REF);
    if (match) {
        const indice = Number(match[1]);
        if (!resultados || !resultados.has(indice)) falla(`${donde}: ${token} no tiene un resultado previo ejecutado.`);
        return resultados.get(indice);
    }
    if (!ID.test(token) || !Object.hasOwn(vars, token) || !Number.isFinite(vars[token])) falla(`${donde}: «${token}» no tiene un valor definido.`);
    return vars[token];
}
function ejecutarEtapaNPI(texto, etapa, inicial) {
    const vars = { ...inicial };
    const pila = [], tokens = texto.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length || tokens.length > 70) falla(`Etapa ${etapa.clave}: escribe una expresión NPI válida (máximo 70 elementos).`);
    let asignaciones = 0;
    for (const [i, token] of tokens.entries()) {
        const donde = `${etapa.clave}, elemento ${i+1} (${token})`;
        if (OPS.has(token) || token === '=') {
            if (pila.length < 2) falla(`${donde}: faltan operandos.`);
            const derecha = pila.pop(), izquierda = pila.pop();
            if (token === '=') {
                if (!etapa.destino || izquierda.tipo !== 'nombre' || izquierda.nombre !== etapa.destino) falla(`${donde}: el destino debe ser ${etapa.destino ?? 'una expresión sin asignación'}.`);
                vars[etapa.destino] = leer(derecha, vars, donde);
                asignaciones++;
            } else pila.push({ tipo: 'valor', valor: aplicar(token, leer(izquierda, vars, donde), leer(derecha, vars, donde), donde) });
        } else if (NUM.test(token)) pila.push({ tipo: 'valor', valor: Number(token) });
        else if (ID.test(token)) pila.push({ tipo: 'nombre', nombre: token });
        else falla(`${donde}: símbolo inválido; usa espacios entre los elementos.`);
    }
    if (etapa.destino) {
        if (asignaciones !== 1 || pila.length) falla(`Etapa ${etapa.clave}: termina con una única asignación (=), sin elementos sobrantes.`);
        return vars[etapa.destino];
    }
    if (asignaciones || pila.length !== 1) falla(`Etapa ${etapa.clave}: la condición debe dejar un único resultado en la pila, sin «=».`);
    return leer(pila[0], vars, etapa.clave);
}
function leer(item, vars, donde) { return item.tipo === 'valor' ? item.valor : leerValor(item.nombre, vars, null, donde); }
function prepararNPI(texto, etapas) {
    const lineas = texto.replace(/\r/g, '').split('\n').map(s => s.trim()).filter(Boolean);
    if (lineas.length !== etapas.length) falla(`Necesitas ${etapas.length} línea(s) de NPI, una por etapa. No mezcles todos los bloques en una sola expresión.`);
    return etapas.map((etapa, i) => {
        const linea = lineas[i];
        const coincidencia = linea.match(/^([\w]+)\s*:\s*(.*?)\s*$/);
        if (etapas.length > 1 && !coincidencia) falla(`Línea ${i+1}: utiliza «${etapa.clave}: ...».`);
        if (coincidencia && coincidencia[1].toUpperCase() !== etapa.clave.toUpperCase()) falla(`Línea ${i+1}: se esperaba la etapa ${etapa.clave}.`);
        return coincidencia ? coincidencia[2] : linea;
    });
}
function prepararFilas(texto, tipo) {
    const filas = analizarFilas(texto, tipo === 'triplos' ? 3 : 4);
    if (filas.length > 48) falla('Máximo 48 filas de triplos/cuádruplos por ejercicio.');
    const etiquetas = new Map();
    for (const fila of filas) {
        const [op, a, b, c] = fila.campos;
        const donde = `${tipo === 'triplos' ? 'Triplo' : 'Cuádruplo'} ${fila.indice}`;
        if (!OPS.has(op) && !['=', 'LABEL', 'GOTO', 'JMP', 'JT'].includes(op.toUpperCase())) falla(`${donde}: operador «${op}» desconocido.`);
        if (op.toUpperCase() === 'LABEL') {
            const nombre = tipo === 'triplos' ? a : c;
            if (!ID.test(nombre)) falla(`${donde}: nombre de etiqueta inválido.`);
            if (etiquetas.has(nombre.toLowerCase())) falla(`${donde}: la etiqueta «${nombre}» ya existe.`);
            etiquetas.set(nombre.toLowerCase(), fila.indice);
        }
    }
    for (const fila of filas) {
        const op = fila.campos[0].toUpperCase();
        if (op === 'JT' || op === 'GOTO' || op === 'JMP') {
            const nombre = tipo === 'triplos' ? (op === 'JT' ? fila.campos[2] : fila.campos[1]) : fila.campos[3];
            if (!etiquetas.has(nombre.toLowerCase())) falla(`Fila ${fila.indice}: no existe la etiqueta «${nombre}».`);
        }
    }
    return { filas, etiquetas };
}
function ejecutarTabla(compilado, tipo, datos) {
    const { filas, etiquetas } = compilado;
    const vars = { ...datos }, referencias = new Map();
    const esTriplo = tipo === 'triplos';
    let pc = 0, pasos = 0;
    while (pc < filas.length) {
        if (++pasos > 1800) falla('Demasiadas operaciones: revisa los saltos; puede haber un ciclo infinito.');
        const { indice, campos } = filas[pc];
        const [operador, a, b, c] = campos;
        const op = operador.toUpperCase();
        const donde = `Fila ${indice}`;
        let siguiente = pc + 1;
        if (OPS.has(operador)) {
            const valor = aplicar(operador,
                leerValor(a, vars, esTriplo ? referencias : null, donde),
                leerValor(b, vars, esTriplo ? referencias : null, donde), donde);
            if (esTriplo) referencias.set(indice, valor);
            else {
                if (!/^t\d+$/i.test(c)) falla(`${donde}: el resultado debe ser un temporal t1, t2, etc.`);
                vars[c] = valor;
            }
        } else if (op === '=') {
            const destino = esTriplo ? a : c;
            const origen = esTriplo ? b : a;
            if (!ID.test(destino)) falla(`${donde}: variable destino inválida.`);
            if (!esTriplo && !VACIO.test(b)) falla(`${donde}: deja «—» en el tercer campo de la asignación.`);
            vars[destino] = leerValor(origen, vars, esTriplo ? referencias : null, donde);
            if (esTriplo) referencias.set(indice, vars[destino]);
        } else if (op === 'LABEL') {
            if (esTriplo && !VACIO.test(b)) falla(`${donde}: usa «—» como tercer campo en LABEL.`);
            if (!esTriplo && (!VACIO.test(a) || !VACIO.test(b))) falla(`${donde}: en LABEL los argumentos no utilizados deben ser «—».`);
        } else if (op === 'GOTO' || op === 'JMP') {
            if (esTriplo && !VACIO.test(b)) falla(`${donde}: en GOTO el tercer campo es «—».`);
            if (!esTriplo && (!VACIO.test(a) || !VACIO.test(b))) falla(`${donde}: en GOTO los argumentos no utilizados deben ser «—».`);
            const destino = esTriplo ? a : c;
            siguiente = etiquetas.get(destino.toLowerCase());
        } else if (op === 'JT') {
            if (!esTriplo && !VACIO.test(b)) falla(`${donde}: deja «—» en el tercer campo de JT.`);
            const condicion = leerValor(a, vars, esTriplo ? referencias : null, donde);
            if (condicion !== 0) siguiente = etiquetas.get((esTriplo ? b : c).toLowerCase());
        }
        pc = siguiente;
    }
    return vars;
}
export function validarUnificado(texto, ejercicio) {
    try {
        const { representacion, etapas, pruebas, variablesSalida, variablesConstantes } = ejercicio;
        if (representacion === 'npi') {
            const npi = prepararNPI(texto, etapas);
            for (const [i, datos] of pruebas.entries()) {
                for (const [j, etapa] of etapas.entries()) {
                    const obtenido = ejecutarEtapaNPI(npi[j], etapa, datos);
                    // En las asignaciones de etapas se espera el resultado de la expresión;
                    // en condiciones se conserva el valor de la condición ORIGINAL del fuente.
                    const esperado = evaluarArbolUnificado(etapa.arbol, datos);
                    if (!iguales(obtenido, esperado)) return { correcto: false, titulo: 'NPI incorrecta', detalle: `Etapa ${etapa.clave}: con ${listado(datos)} el resultado debería ser ${esperado}, pero obtuviste ${obtenido}.` };
                }
            }
            return { correcto: true, titulo: '¡NPI correcta por etapas!', detalle: `${etapas.length} expresión(es) comprobada(s) con ${pruebas.length} combinaciones de valores. NPI aquí no codifica el control de flujo.` };
        }
        if (representacion !== 'triplos' && representacion !== 'cuadruplos') falla('Representación no reconocida.');
        const compilado = prepararFilas(texto, representacion);
        for (const [i, datos] of pruebas.entries()) {
            const estado = ejecutarTabla(compilado, representacion, ejercicio.inicializar(datos));
            const esperado = ejercicio.calcularEsperado(datos);
            for (const variable of variablesSalida) {
                if (!iguales(estado[variable], esperado[variable])) {
                    return { correcto: false, titulo: i ? 'Falló con otros valores' : 'Resultado incorrecto', detalle: `Con ${listado(datos)}, ${variable} debería ser ${esperado[variable]}, pero obtuviste ${estado[variable] ?? 'sin valor'}. Revisa referencias, operandos, saltos y etiquetas.` };
                }
            }
            for (const variable of variablesConstantes) {
                if (!iguales(estado[variable], datos[variable])) falla(`No debes modificar la variable de entrada ${variable}.`);
            }
        }
        return { correcto: true, titulo: `¡${representacion === 'triplos' ? 'Triplos' : 'Cuádruplos'} correctos!`, detalle: `La representación reproduce las salidas del programa con ${pruebas.length} combinaciones de valores. Se aceptan otras traducciones equivalentes dentro del lenguaje soportado.` };
    } catch (error) { return { correcto: false, titulo: 'Revisa la representación', detalle: error.message }; }
}
// Conviene aislar la evaluación del AST respecto del intérprete de la respuesta.
import { evaluarArbol as evaluarArbolUnificado } from './codigo-unificado.js';
