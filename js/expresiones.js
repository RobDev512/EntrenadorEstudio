/* Expresiones y soluciones para la Unidad 2: NPI, triplos y cuádruplos.
   Convenio docente: NPI de asignación = destino, expresión en postorden, =.
   Triplo de asignación (=, destino, origen) y cuádruplo (=, origen, —, destino). */
const v = (nombre) => ({ tipo: 'var', nombre });
const n = (valor) => ({ tipo: 'num', valor });
const b = (op, izquierdo, derecho) => ({ tipo: 'bin', op, izquierdo, derecho });
const mas = (a, c) => b('+', a, c);
const menos = (a, c) => b('-', a, c);
const por = (a, c) => b('*', a, c);
const div = (a, c) => b('/', a, c);
const entero = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const MODELOS_ARITMETICOS = [
    { destino: 'C', plantilla: 'C = (a + b) * (a - b);', vars: ['a', 'b'], arbol: por(mas(v('a'), v('b')), menos(v('a'), v('b'))) },
    { destino: 'C', plantilla: 'C = a * b + (a - b);', vars: ['a', 'b'], arbol: mas(por(v('a'), v('b')), menos(v('a'), v('b'))) },
    { destino: 'C', plantilla: 'C = a - b * (a + b);', vars: ['a', 'b'], arbol: menos(v('a'), por(v('b'), mas(v('a'), v('b')))) },
    { destino: 'C', plantilla: 'C = (a * a - b) / 2;', vars: ['a', 'b'], arbol: div(menos(por(v('a'), v('a')), v('b')), n(2)) },
    { destino: 'R', plantilla: 'R = (x + 3) * (y - 2);', vars: ['x', 'y'], arbol: por(mas(v('x'), n(3)), menos(v('y'), n(2))) },
    { destino: 'R', plantilla: 'R = x * y + (x - 4);', vars: ['x', 'y'], arbol: mas(por(v('x'), v('y')), menos(v('x'), n(4))) },
    { destino: 'P', plantilla: 'P = (a + 2) * (b + 3);', vars: ['a', 'b'], arbol: por(mas(v('a'), n(2)), mas(v('b'), n(3))) },
    { destino: 'P', plantilla: 'P = (a - b) / (b + 1);', vars: ['a', 'b'], arbol: div(menos(v('a'), v('b')), mas(v('b'), n(1))) },
    { destino: 'R', plantilla: 'R = (x + y) * (x + 2) - y;', vars: ['x', 'y'], arbol: menos(por(mas(v('x'), v('y')), mas(v('x'), n(2))), v('y')) }
];

export function evaluarExpresion(nodo, variables) {
    if (nodo.tipo === 'var') return variables[nodo.nombre];
    if (nodo.tipo === 'num') return nodo.valor;
    const a = evaluarExpresion(nodo.izquierdo, variables);
    const c = evaluarExpresion(nodo.derecho, variables);
    switch (nodo.op) {
        case '+': return a + c;
        case '-': return a - c;
        case '*': return a * c;
        case '/': return a / c;
        default: throw new Error('Operación desconocida en el modelo.');
    }
}

function postorden(nodo, salida) {
    if (nodo.tipo === 'var') { salida.push(nodo.nombre); return; }
    if (nodo.tipo === 'num') { salida.push(String(nodo.valor)); return; }
    postorden(nodo.izquierdo, salida);
    postorden(nodo.derecho, salida);
    salida.push(nodo.op);
}

export function referenciaNPI(modelo) {
    const tokens = [modelo.destino];
    postorden(modelo.arbol, tokens);
    tokens.push('=');
    return tokens.join(' ');
}

export function referenciaTriplos(modelo) {
    const filas = [];
    function recorrer(nodo) {
        if (nodo.tipo === 'var') return nodo.nombre;
        if (nodo.tipo === 'num') return String(nodo.valor);
        const izq = recorrer(nodo.izquierdo);
        const der = recorrer(nodo.derecho);
        const indice = filas.length;
        filas.push(`(${indice}): (${nodo.op}, ${izq}, ${der})`);
        return `(${indice})`;
    }
    const resultado = recorrer(modelo.arbol);
    filas.push(`(${filas.length}): (=, ${modelo.destino}, ${resultado})`);
    return filas.join('\n');
}

export function referenciaCuadruplos(modelo) {
    const filas = [];
    let temporal = 0;
    function recorrer(nodo) {
        if (nodo.tipo === 'var') return nodo.nombre;
        if (nodo.tipo === 'num') return String(nodo.valor);
        const izq = recorrer(nodo.izquierdo);
        const der = recorrer(nodo.derecho);
        const res = `t${++temporal}`;
        filas.push(`${filas.length}: (${nodo.op}, ${izq}, ${der}, ${res})`);
        return res;
    }
    const resultado = recorrer(modelo.arbol);
    filas.push(`${filas.length}: (=, ${resultado}, —, ${modelo.destino})`);
    return filas.join('\n');
}

export function crearRepresentacion(tipo) {
    const modelo = MODELOS_ARITMETICOS[entero(0, MODELOS_ARITMETICOS.length - 1)];
    const valores = () => Object.fromEntries(modelo.vars.map(nombre => [nombre, entero(2, 10)]));
    const entradaVisible = valores();
    const pruebas = [entradaVisible, ...Array.from({ length: 8 }, valores)];
    const tipoTitulo = { npi: 'Notación Polaca Inversa', triplos: 'Triplos', cuadruplos: 'Cuádruplos' }[tipo];
    const referencia = tipo === 'npi' ? referenciaNPI(modelo) : tipo === 'triplos' ? referenciaTriplos(modelo) : referenciaCuadruplos(modelo);
    const especificas = {
        npi: ['Identifica primero el operador de cada subexpresión y escribe sus operandos en postorden.', `Como es asignación, empieza por ${modelo.destino} y termina con =.`, 'Respeta los paréntesis y la precedencia: operandos antes de cada operador.'],
        triplos: ['Cada operación requiere una fila (operador, argumento1, argumento2).', 'Usa (0), (1), etc., para reutilizar resultados anteriores.', `Termina con (=, ${modelo.destino}, (n)) para guardar el resultado.`],
        cuadruplos: ['Cada operación requiere (operador, argumento1, argumento2, resultado).', 'Guarda los resultados intermedios en t1, t2, etc. y reutilízalos.', `Termina con (=, temporal, —, ${modelo.destino}) para asignar.`]
    };
    return {
        tipo, nombre: tipoTitulo, dificultad: 'Intermedio',
        enunciado: `Convierte la siguiente asignación a ${tipoTitulo}. Comprueba el orden de las operaciones.`,
        expresion: modelo.plantilla, entradaVisible, pruebas, referencia,
        calcularEsperado: datos => ({ [modelo.destino]: evaluarExpresion(modelo.arbol, datos) }),
        variablesSalida: [modelo.destino], variablesConstantes: modelo.vars,
        pistas: especificas[tipo], editor: tipo === 'npi' ? 'texto' : 'tabla',
        columnas: tipo === 'triplos' ? ['Operador', 'Argumento 1', 'Argumento 2'] : ['Operador', 'Argumento 1', 'Argumento 2', 'Resultado']
    };
}
