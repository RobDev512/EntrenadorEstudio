/* Validación semántica controlada de NPI, triplos y cuádruplos.
   Se comprueba el resultado en múltiples conjuntos de valores, sin ejecutar JS del usuario. */
const NUMERO = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/;
const IDENT = /^[a-zA-Z_][\w]*$/;
const VACIO = /^(?:—|–|-|_)$/;
const OP = new Set(['+', '-', '*', '/']);
const FORMAS = { npi: 'NPI', triplos: 'triplos', cuadruplos: 'cuádruplos' };

class ErrorRepresentacion extends Error {
    constructor(mensaje) { super(mensaje); this.name = 'ErrorRepresentacion'; }
}
function falla(texto) { throw new ErrorRepresentacion(texto); }
function operar(op, a, b, linea) {
    if (op === '/' && Math.abs(b) < 1e-12) falla(`División entre cero en ${linea}.`);
    const res = { '+': a + b, '-': a - b, '*': a * b, '/': a / b }[op];
    if (!Number.isFinite(res)) falla(`Resultado numérico no válido en ${linea}.`);
    return res;
}
function cerca(a, b) {
    return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-8 * Math.max(1, Math.abs(a), Math.abs(b));
}
function obtenerTermino(token, variables, referencias, contexto) {
    const texto = token.trim();
    if (NUMERO.test(texto)) return Number(texto);
    const match = texto.match(/^\((\d+)\)$/);
    if (match) {
        if (!referencias || !referencias.has(Number(match[1]))) falla(`${contexto}: la referencia ${texto} no corresponde a un resultado anterior.`);
        return referencias.get(Number(match[1]));
    }
    if (Object.hasOwn(variables, texto) && Number.isFinite(variables[texto])) return variables[texto];
    falla(`${contexto}: no existe un valor definido para «${texto}». Revisa referencias, nombres y temporales.`);
}

export function analizarFilas(texto, columnas) {
    const filas = texto.replace(/\r/g, '').split('\n').map(s => s.trim()).filter(Boolean);
    if (!filas.length) falla('Añade al menos una fila de instrucciones.');
    if (filas.length > 48) falla('Demasiadas filas para este ejercicio (máximo 48).');
    return filas.map((linea, i) => {
        const m = linea.match(/^(?:\((\d+)\)|(\d+))\s*:\s*\((.*)\)\s*;?$/);
        if (!m) falla(`Fila ${i}: usa ${columnas === 3 ? '(0): (+, a, b)' : '0: (+, a, b, t1)'}.`);
        const indice = Number(m[1] ?? m[2]);
        if (indice !== i) falla(`Los índices deben ser consecutivos desde 0: la fila ${i + 1} debe tener índice ${i}.`);
        const campos = m[3].split(',').map(s => s.trim());
        if (campos.length !== columnas || campos.some(s => !s)) falla(`Fila ${i}: se necesitan exactamente ${columnas} campos completos.`);
        return { indice, campos };
    });
}

function ejecutarNPI(texto, inicial, destino) {
    const tokens = texto.replace(/[;\n\r\t]/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) falla('Escribe la NPI de la asignación.');
    if (tokens.length > 80) falla('La NPI es demasiado larga.');
    const pila = [], variables = { ...inicial };
    let asignaciones = 0;
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const linea = `posición ${i + 1} (${token})`;
        if (OP.has(token) || token === '=') {
            if (pila.length < 2) falla(`Faltan operandos antes de «${token}» en la ${linea}.`);
            const derecha = pila.pop(), izquierda = pila.pop();
            if (token === '=') {
                if (izquierda.tipo !== 'ident') falla('Para la asignación, coloca la variable destino al principio de la NPI.');
                if (izquierda.texto !== destino) falla(`El destino debe ser ${destino}, no ${izquierda.texto}.`);
                const valor = leer(derecha, variables, linea);
                variables[izquierda.texto] = valor;
                asignaciones++;
            } else {
                pila.push({ tipo: 'valor', valor: operar(token, leer(izquierda, variables, linea), leer(derecha, variables, linea), linea) });
            }
        } else if (NUMERO.test(token)) pila.push({ tipo: 'valor', valor: Number(token) });
        else if (IDENT.test(token)) pila.push({ tipo: 'ident', texto: token });
        else falla(`Símbolo «${token}» no reconocido. Separa cada elemento con espacios.`);
    }
    if (asignaciones !== 1) falla('La NPI debe incluir una asignación con = al final.');
    if (pila.length) falla('Quedaron elementos sin usar en la pila de NPI; revisa el orden de operadores.');
    return variables;
}
function leer(item, vars, contexto) {
    if (item.tipo === 'valor') return item.valor;
    if (!Object.hasOwn(vars, item.texto)) falla(`${contexto}: la variable «${item.texto}» todavía no tiene valor.`);
    return vars[item.texto];
}

function ejecutarTriplos(filas, inicial, destino) {
    const vars = { ...inicial };
    const resultados = new Map();
    let asignaciones = 0;
    for (const { indice, campos } of filas) {
        const [op, arg1, arg2] = campos;
        const linea = `triplo (${indice})`;
        if (OP.has(op)) {
            resultados.set(indice, operar(op, obtenerTermino(arg1, vars, resultados, linea), obtenerTermino(arg2, vars, resultados, linea), linea));
        } else if (op === '=') {
            if (!IDENT.test(arg1)) falla(`${linea}: la asignación debe escribirse (=, destino, origen).`);
            if (arg1 !== destino) falla(`${linea}: se esperaba asignar a ${destino}, no a ${arg1}.`);
            vars[arg1] = obtenerTermino(arg2, vars, resultados, linea);
            resultados.set(indice, vars[arg1]);
            asignaciones++;
        } else falla(`${linea}: el operador «${op}» no está disponible en este ejercicio.`);
    }
    if (!asignaciones) falla(`Falta el triplo final de asignación (=, ${destino}, (n)).`);
    return vars;
}

function ejecutarCuadruplos(filas, inicial, destino) {
    const vars = { ...inicial };
    let asignaciones = 0;
    for (const { indice, campos } of filas) {
        const [op, arg1, arg2, res] = campos;
        const linea = `cuádruplo ${indice}`;
        if (OP.has(op)) {
            if (!IDENT.test(res) || !/^t\d+$/i.test(res)) falla(`${linea}: usa un temporal como t1 en el resultado de la operación.`);
            vars[res] = operar(op, obtenerTermino(arg1, vars, null, linea), obtenerTermino(arg2, vars, null, linea), linea);
        } else if (op === '=') {
            if (!VACIO.test(arg2)) falla(`${linea}: el tercer campo de la asignación debe ser — (sin utilizar).`);
            if (res !== destino) falla(`${linea}: el destino final debe ser ${destino}.`);
            vars[res] = obtenerTermino(arg1, vars, null, linea);
            asignaciones++;
        } else falla(`${linea}: el operador «${op}» no está disponible en este ejercicio.`);
    }
    if (!asignaciones) falla(`Falta el cuádruplo final de asignación (=, temporal, —, ${destino}).`);
    return vars;
}

export function validarRepresentacion(texto, ejercicio) {
    const destino = ejercicio.variablesSalida[0];
    try {
        let filas;
        if (ejercicio.tipo !== 'npi') filas = analizarFilas(texto, ejercicio.tipo === 'triplos' ? 3 : 4);
        for (let i = 0; i < ejercicio.pruebas.length; i++) {
            const datos = ejercicio.pruebas[i];
            const estado = ejercicio.tipo === 'npi' ? ejecutarNPI(texto, datos, destino)
                : ejercicio.tipo === 'triplos' ? ejecutarTriplos(filas, datos, destino)
                : ejecutarCuadruplos(filas, datos, destino);
            const esperado = ejercicio.calcularEsperado(datos)[destino];
            if (!cerca(estado[destino], esperado)) {
                const visible = Object.entries(datos).map(([k, v]) => `${k}=${v}`).join(', ');
                const recibido = estado[destino] === undefined ? 'sin valor' : String(estado[destino]);
                return { correcto: false, titulo: i ? 'Error con otros valores' : 'Resultado incorrecto', detalle: `Con ${visible}, ${destino} debe ser ${esperado}, pero obtuviste ${recibido}. Revisa operadores, referencias y el orden de los argumentos.` };
            }
            for (const nombre of ejercicio.variablesConstantes) {
                if (!cerca(estado[nombre], datos[nombre])) falla(`No debes modificar la variable de entrada ${nombre}.`);
            }
        }
        return { correcto: true, titulo: `¡${FORMAS[ejercicio.tipo]} correcta!`, detalle: `El resultado coincide en ${ejercicio.pruebas.length} casos de prueba. Se admiten distintas representaciones equivalentes; esta comprobación no es una prueba formal universal.` };
    } catch (error) {
        return { correcto: false, titulo: 'Revisa la representación', detalle: error.message };
    }
}
