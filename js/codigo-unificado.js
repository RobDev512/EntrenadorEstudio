/* Un código fuente, cuatro representaciones.
   NPI en controles: descomposición de EXPRESIONES por etapa, sin inventar
   una convención docente de saltos para NPI.
   Triplos/cuádruplos: incluyen ramas, etiquetas y saltos ejecutables. */
import { MODELOS_ARITMETICOS } from './expresiones.js';
const variable = nombre => ({ tipo: 'var', nombre });
const numero = valor => ({ tipo: 'num', valor });
const binario = (op, izq, der) => ({ tipo: 'bin', op, izquierdo: izq, derecho: der });
const V = variable, N = numero, B = binario;
const asig = (destino, arbol) => ({ tipo: 'asignar', destino, arbol });
const cond = arbol => ({ tipo: 'condicion', arbol });
const etiqueta = nombre => ({ tipo: 'etiqueta', nombre });
const salto = nombre => ({ tipo: 'salto', nombre });
const saltoSi = nombre => ({ tipo: 'saltoSi', nombre });
const paso = (clave, descripcion, arbol, destino = null) => ({ clave, descripcion, arbol, destino });
const deFuente = (texto, patron, nombre) => {
    const match = texto.match(patron);
    if (!match) throw new Error(`No pude extraer ${nombre} del programa fuente.`);
    return Number(match[1]);
};

export function modeloDesdeCodigo(ejercicio) {
    if (ejercicio.tipo === 'aritmetica') {
        const modelo = MODELOS_ARITMETICOS.find(item => item.plantilla === ejercicio.expresion);
        if (!modelo) throw new Error('No hay modelo de expresión para la operación aritmética.');
        return {
            etapas: [paso('ASIGNACION', 'Asignación completa', modelo.arbol, modelo.destino)],
            pasos: [asig(modelo.destino, modelo.arbol)]
        };
    }
    if (ejercicio.tipo === 'ifelse') {
        const c = deFuente(ejercicio.expresion, /Z\s*=\s*x\s*\+\s*(\d+)/, 'constante if/else');
        return {
            etapas: [
                paso('CONDICION', 'Condición de IF', B('>', V('x'), V('y'))),
                paso('IF', 'Asignación si es verdadero', B('+', V('x'), N(c)), 'Z'),
                paso('ELSE', 'Asignación si es falso', B('-', V('y'), N(c)), 'Z')
            ],
            pasos: [cond(B('>', V('x'), V('y'))), saltoSi('IfVerdadero'),
                asig('Z', B('-', V('y'), N(c))), salto('FinIf'), etiqueta('IfVerdadero'),
                asig('Z', B('+', V('x'), N(c))), etiqueta('FinIf')]
        };
    }
    if (ejercicio.tipo === 'while') {
        const c = deFuente(ejercicio.expresion, /while\s*\(i\s*<\s*(\d+)\)/, 'límite while');
        return {
            etapas: [
                paso('INICIO', 'Inicialización de i', N(0), 'i'),
                paso('CONDICION', 'Condición original', B('<', V('i'), N(c))),
                paso('CUERPO1', 'Acumular sum', B('+', V('sum'), V('i')), 'sum'),
                paso('CUERPO2', 'Incrementar i', B('+', V('i'), N(1)), 'i')
            ],
            pasos: [asig('i', N(0)), etiqueta('While'), cond(B('>=', V('i'), N(c))),
                saltoSi('FinWhile'), asig('sum', B('+', V('sum'), V('i'))),
                asig('i', B('+', V('i'), N(1))), salto('While'), etiqueta('FinWhile')]
        };
    }
    if (ejercicio.tipo === 'for') {
        const c = deFuente(ejercicio.expresion, /j\s*<=\s*(\d+)/, 'límite for');
        return {
            etapas: [
                paso('INICIO', 'Inicialización de j', N(1), 'j'),
                paso('CONDICION', 'Condición original', B('<=', V('j'), N(c))),
                paso('CUERPO', 'Multiplicación de product', B('*', V('product'), V('j')), 'product'),
                paso('INCREMENTO', 'Incremento de j', B('+', V('j'), N(1)), 'j')
            ],
            pasos: [asig('j', N(1)), etiqueta('For'), cond(B('>', V('j'), N(c))),
                saltoSi('FinFor'), asig('product', B('*', V('product'), V('j'))),
                asig('j', B('+', V('j'), N(1))), salto('For'), etiqueta('FinFor')]
        };
    }
    if (ejercicio.tipo === 'dowhile') {
        const c = deFuente(ejercicio.expresion, /while\s*\(k\s*<=\s*(\d+)\)/, 'límite do/while');
        return {
            etapas: [
                paso('INICIO', 'Inicialización de k', N(1), 'k'),
                paso('CUERPO1', 'Acumular total', B('+', V('total'), V('k')), 'total'),
                paso('CUERPO2', 'Incrementar k', B('+', V('k'), N(2)), 'k'),
                paso('CONDICION', 'Condición al final del ciclo', B('<=', V('k'), N(c)))
            ],
            pasos: [asig('k', N(1)), etiqueta('Do'),
                asig('total', B('+', V('total'), V('k'))), asig('k', B('+', V('k'), N(2))),
                cond(B('<=', V('k'), N(c))), saltoSi('Do'), etiqueta('FinDo')]
        };
    }
    throw new Error('El tipo de código fuente todavía no admite paquete unificado.');
}

export function evaluarArbol(nodo, variables) {
    if (nodo.tipo === 'var') return variables[nodo.nombre];
    if (nodo.tipo === 'num') return nodo.valor;
    const a = evaluarArbol(nodo.izquierdo, variables), b = evaluarArbol(nodo.derecho, variables);
    switch (nodo.op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        case '>': return a > b ? 1 : 0;
        case '>=': return a >= b ? 1 : 0;
        case '<': return a < b ? 1 : 0;
        case '<=': return a <= b ? 1 : 0;
        default: throw new Error('Operador desconocido en el modelo.');
    }
}
function postorden(nodo, tokens) {
    if (nodo.tipo === 'var') { tokens.push(nodo.nombre); return; }
    if (nodo.tipo === 'num') { tokens.push(String(nodo.valor)); return; }
    postorden(nodo.izquierdo, tokens); postorden(nodo.derecho, tokens); tokens.push(nodo.op);
}
function npiReferencia(etapas) {
    return etapas.map(etapa => {
        const tokens = etapa.destino ? [etapa.destino] : [];
        postorden(etapa.arbol, tokens);
        if (etapa.destino) tokens.push('=');
        return `${etapa.clave}: ${tokens.join(' ')}`;
    }).join('\n');
}

function generarTabla(pasos, tipo) {
    const filas = [];
    let ultimo = null, t = 0;
    const agregar = campos => {
        const indice = filas.length;
        filas.push(tipo === 'triplos' ? `(${indice}): (${campos.join(', ')})` : `${indice}: (${campos.join(', ')})`);
        return tipo === 'triplos' ? `(${indice})` : null;
    };
    const termino = nodo => {
        if (nodo.tipo === 'var') return nodo.nombre;
        if (nodo.tipo === 'num') return String(nodo.valor);
        const izq = termino(nodo.izquierdo), der = termino(nodo.derecho);
        if (tipo === 'triplos') return agregar([nodo.op, izq, der]);
        const temporal = `t${++t}`;
        agregar([nodo.op, izq, der, temporal]);
        return temporal;
    };
    for (const instruccion of pasos) {
        if (instruccion.tipo === 'asignar') {
            const origen = termino(instruccion.arbol);
            if (tipo === 'triplos') agregar(['=', instruccion.destino, origen]);
            else agregar(['=', origen, '—', instruccion.destino]);
        } else if (instruccion.tipo === 'condicion') ultimo = termino(instruccion.arbol);
        else if (instruccion.tipo === 'saltoSi') {
            if (tipo === 'triplos') agregar(['JT', ultimo, instruccion.nombre]);
            else agregar(['JT', ultimo, '—', instruccion.nombre]);
        } else if (instruccion.tipo === 'salto') {
            if (tipo === 'triplos') agregar(['GOTO', instruccion.nombre, '—']);
            else agregar(['GOTO', '—', '—', instruccion.nombre]);
        } else if (instruccion.tipo === 'etiqueta') {
            if (tipo === 'triplos') agregar(['LABEL', instruccion.nombre, '—']);
            else agregar(['LABEL', '—', '—', instruccion.nombre]);
        }
    }
    return filas.join('\n');
}

export const REPRESENTACIONES = [
    { id: 'npi', nombre: 'NPI' },
    { id: 'codigoP', nombre: 'Código P' },
    { id: 'triplos', nombre: 'Triplos' },
    { id: 'cuadruplos', nombre: 'Cuádruplos' }
];
export function crearPaquete(codigo) {
    const modelo = modeloDesdeCodigo(codigo);
    const general = {
        ...codigo,
        idFuente: codigo.tipo,
        etapas: modelo.etapas,
        pasosModelo: modelo.pasos
    };
    return {
        fuente: codigo,
        versiones: {
            codigoP: { ...general, representacion: 'codigoP', referencia: codigo.referencia,
                editor: 'texto', pistas: codigo.pistas },
            npi: { ...general, tipo: 'npi', representacion: 'npi', referencia: npiReferencia(modelo.etapas),
                editor: 'texto', pistas: [
                    'Cada línea corresponde a una expresión o asignación del código fuente, identificada por su etapa.',
                    'En la NPI de asignación se escribe primero el destino y se termina con =.',
                    'Para condicionales y ciclos, NPI representa las expresiones por separado; no sustituye a los saltos del Código P.'
                ] },
            triplos: { ...general, tipo: 'triplos', representacion: 'triplos',
                editor: 'tabla', columnas: ['Operador', 'Argumento 1', 'Argumento 2'],
                referencia: generarTabla(modelo.pasos, 'triplos'),
                pistas: ['Cada operación se guarda en una fila; utiliza (n) para recuperar su resultado.',
                    'En controles, JT evalúa una referencia de comparación y salta a una etiqueta.',
                    'Para el flujo completo utiliza LABEL y GOTO cuando correspondan.'] },
            cuadruplos: { ...general, tipo: 'cuadruplos', representacion: 'cuadruplos',
                editor: 'tabla', columnas: ['Operador', 'Argumento 1', 'Argumento 2', 'Resultado'],
                referencia: generarTabla(modelo.pasos, 'cuadruplos'),
                pistas: ['Guarda resultados intermedios en temporales t1, t2, etc.',
                    'En saltos usa (JT, t1, —, Etiqueta) o (GOTO, —, —, Etiqueta).',
                    'En asignaciones usa (=, origen, —, destino), y en etiquetas LABEL.'] }
        }
    };
}
