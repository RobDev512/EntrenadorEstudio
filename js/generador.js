import { crearRepresentacion } from './expresiones.js';
/* Bancos generativos, sin respuestas escritas por el estudiante precargadas. */
const entero = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const escoger = (valores) => valores[entero(0, valores.length - 1)];

const modelosAritmetica = [
    {
        expresion: 'C = (a + b) * (a - b);',
        inicial: ({ a, b }) => ({ a, b }),
        evaluar: ({ a, b }) => ({ C: (a + b) * (a - b) }),
        solucion: `LOD a\nLOD b\nADD\nLOD a\nLOD b\nSUB\nMUL\nSTO C`,
        pista: ['Primero resuelve las operaciones entre paréntesis.', 'La resta necesita LOD a, LOD b y SUB, en ese orden.']
    },
    {
        expresion: 'C = a * b + (a - b);',
        inicial: ({ a, b }) => ({ a, b }),
        evaluar: ({ a, b }) => ({ C: a * b + (a - b) }),
        solucion: `LOD a\nLOD b\nMUL\nLOD a\nLOD b\nSUB\nADD\nSTO C`,
        pista: ['Calcula primero la multiplicación y la resta.', 'Los dos resultados deben estar en la pila antes de ADD.']
    },
    {
        expresion: 'C = a - b * (a + b);',
        inicial: ({ a, b }) => ({ a, b }),
        evaluar: ({ a, b }) => ({ C: a - b * (a + b) }),
        solucion: `LOD a\nLOD b\nLOD a\nLOD b\nADD\nMUL\nSUB\nSTO C`,
        pista: ['En una resta importa el orden de los operandos.', 'Primero deja a en la pila; después calcula b*(a+b).']
    },
    {
        expresion: 'C = (a * a - b) / 2;',
        inicial: ({ a, b }) => ({ a, b }),
        evaluar: ({ a, b }) => ({ C: (a * a - b) / 2 }),
        solucion: `LOD a\nLOD a\nMUL\nLOD b\nSUB\nLIT 2\nDIV\nSTO C`,
        pista: ['DIV consume dos números: primero el dividendo y después el divisor.', 'Usa LIT 2 para poner el divisor en la pila.']
    }
];

function crearAritmetica() {
    const modelo = escoger(modelosAritmetica);
    const visible = { a: entero(4, 10), b: entero(1, 3) };
    const pruebas = [visible];
    for (let i = 0; i < 5; i++) pruebas.push({ a: entero(2, 12), b: entero(1, 9) });
    return {
        tipo: 'aritmetica', nombre: 'Operaciones aritméticas', dificultad: 'Básico',
        enunciado: 'Traduce la expresión a Código P. Respeta el orden de la pila y guarda el resultado.',
        expresion: modelo.expresion, entradaVisible: visible, pruebas,
        variablesSalida: ['C'], variablesConstantes: ['a', 'b'],
        referencia: modelo.solucion, calcularEsperado: modelo.evaluar, pistas: modelo.pista,
        inicializar: modelo.inicial
    };
}

function crearIfElse() {
    const umbral = entero(2, 8);
    const visible = { x: entero(1, 10), y: entero(1, 10) };
    return {
        tipo: 'ifelse', nombre: 'Condicional if / else', dificultad: 'Intermedio',
        enunciado: 'Traduce todo el condicional a Código P. JT salta cuando la comparación es verdadera.',
        expresion: `if (x > y) {\n    Z = x + ${umbral};\n} else {\n    Z = y - ${umbral};\n}`,
        entradaVisible: visible,
        pruebas: [visible, { x: 10, y: 2 }, { x: 2, y: 10 }, { x: 5, y: 5 }, ...Array.from({ length: 3 }, () => ({ x: entero(0, 12), y: entero(0, 12) }))],
        variablesSalida: ['Z'], variablesConstantes: ['x', 'y'],
        calcularEsperado: ({ x, y }) => ({ Z: x > y ? x + umbral : y - umbral }),
        inicializar: (datos) => ({ ...datos }),
        referencia: `LOD x\nLOD y\nGT\nJT IfVerdadero\nLOD y\nLIT ${umbral}\nSUB\nSTO Z\nJMP FinIf\nLABEL IfVerdadero\nLOD x\nLIT ${umbral}\nADD\nSTO Z\nLABEL FinIf`,
        pistas: ['Con GT comparas si x > y; JT conduce al bloque verdadero.', 'Si ejecutas el bloque else, necesitas JMP FinIf para evitar ejecutar también el if.']
    };
}

function crearWhile() {
    const limite = entero(3, 7);
    const visible = { sum: 0, i: 0 };
    return {
        tipo: 'while', nombre: 'Ciclo while', dificultad: 'Avanzado',
        enunciado: 'Convierte el programa completo (incluida la inicialización de i) a Código P. sum inicia con el valor indicado.',
        expresion: `i = 0;\nwhile (i < ${limite}) {\n    sum = sum + i;\n    i = i + 1;\n}`,
        entradaVisible: visible,
        pruebas: [visible, ...Array.from({ length: 5 }, () => ({ sum: entero(-5, 15), i: entero(1, 5) }))],
        variablesSalida: ['sum', 'i'], variablesConstantes: [],
        inicializar: (datos) => ({ ...datos }),
        calcularEsperado: ({ sum }) => ({ sum: sum + limite * (limite - 1) / 2, i: limite }),
        referencia: `LIT 0\nSTO i\nLABEL While\nLOD i\nLIT ${limite}\nGE\nJT FinWhile\nLOD sum\nLOD i\nADD\nSTO sum\nLOD i\nLIT 1\nADD\nSTO i\nJMP While\nLABEL FinWhile`,
        pistas: ['Se repite mientras i < límite, así que para salir evalúa i >= límite.', 'Usa GE y JT FinWhile; al final del cuerpo salta con JMP While.']
    };
}

function crearFor() {
    const limite = entero(3, 5);
    const visible = { product: entero(1, 3), j: 0 };
    return {
        tipo: 'for', nombre: 'Ciclo for', dificultad: 'Avanzado',
        enunciado: 'Traduce la inicialización, condición, cuerpo e incremento. product tiene el valor inicial indicado.',
        expresion: `for (j = 1; j <= ${limite}; j++) {\n    product = product * j;\n}`,
        entradaVisible: visible,
        pruebas: [visible, ...Array.from({ length: 5 }, () => ({ product: entero(1, 6), j: entero(0, 9) }))],
        variablesSalida: ['product', 'j'], variablesConstantes: [],
        inicializar: (datos) => ({ ...datos }),
        calcularEsperado: ({ product }) => ({ product: product * Array.from({ length: limite }, (_, i) => i + 1).reduce((a, b) => a * b, 1), j: limite + 1 }),
        referencia: `LIT 1\nSTO j\nLABEL For\nLOD j\nLIT ${limite}\nGT\nJT FinFor\nLOD product\nLOD j\nMUL\nSTO product\nLOD j\nLIT 1\nADD\nSTO j\nJMP For\nLABEL FinFor`,
        pistas: ['Inicializa j = 1 una sola vez, antes del inicio del ciclo.', 'Si el ciclo se ejecuta mientras j <= límite, sal cuando j > límite (GT).']
    };
}

function crearDoWhile() {
    const limite = escoger([7, 9, 11]);
    const visible = { total: entero(0, 5), k: 0 };
    return {
        tipo: 'dowhile', nombre: 'Ciclo do / while', dificultad: 'Avanzado',
        enunciado: 'Traduce el do/while. Atención: el valor inicial de total se proporciona expresamente para poder verificar el resultado.',
        expresion: `k = 1;\ndo {\n    total = total + k;\n    k = k + 2;\n} while (k <= ${limite});`,
        entradaVisible: visible,
        pruebas: [visible, ...Array.from({ length: 5 }, () => ({ total: entero(-4, 12), k: entero(0, 9) }))],
        variablesSalida: ['total', 'k'], variablesConstantes: [],
        inicializar: (datos) => ({ ...datos }),
        calcularEsperado: ({ total }) => { let k = 1; do { total += k; k += 2; } while (k <= limite); return { total, k }; },
        referencia: `LIT 1\nSTO k\nLABEL Do\nLOD total\nLOD k\nADD\nSTO total\nLOD k\nLIT 2\nADD\nSTO k\nLIT ${limite}\nLOD k\nGE\nJT Do`,
        pistas: ['El cuerpo de do/while se ejecuta al menos una vez.', 'Para repetir mientras k <= límite, puedes comparar límite >= k (invirtiendo los operandos de GE).']
    };
}

const creadores = { aritmetica: crearAritmetica, ifelse: crearIfElse, while: crearWhile, for: crearFor, dowhile: crearDoWhile, npi: () => crearRepresentacion('npi'), triplos: () => crearRepresentacion('triplos'), cuadruplos: () => crearRepresentacion('cuadruplos') };
export const TIPOS = [
    { id: 'aritmetica', titulo: 'Operaciones aritméticas', dificultad: 'Básico' },
    { id: 'ifelse', titulo: 'If / Else', dificultad: 'Intermedio' },
    { id: 'while', titulo: 'While', dificultad: 'Avanzado' },
    { id: 'for', titulo: 'For', dificultad: 'Avanzado' },
    { id: 'dowhile', titulo: 'Do / While', dificultad: 'Avanzado' },
    { id: 'npi', titulo: 'NPI', dificultad: 'Intermedio' },
    { id: 'triplos', titulo: 'Triplos', dificultad: 'Intermedio' },
    { id: 'cuadruplos', titulo: 'Cuádruplos', dificultad: 'Intermedio' }
];

export function crearEjercicio(tipo = 'aritmetica') {
    if (tipo === 'aleatorio') tipo = escoger(Object.keys(creadores));
    if (!creadores[tipo]) throw new Error(`Tipo de ejercicio no disponible: ${tipo}`);
    return creadores[tipo]();
}
