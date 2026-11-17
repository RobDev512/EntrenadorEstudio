/* Intérprete controlado de Código P para la Unidad 2.
   JT salta si la condición es verdadera (1), conforme a las resoluciones de clase. */

const VARIABLE = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const NUMERO = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/;
const OPERACIONES = new Set(['ADD', 'SUB', 'MUL', 'DIV', 'GT', 'GE']);

export class ErrorCodigoP extends Error {
    constructor(mensaje, linea = null) {
        super(linea == null ? mensaje : `Línea ${linea}: ${mensaje}`);
        this.name = 'ErrorCodigoP';
        this.linea = linea;
    }
}

export function analizarCodigoP(texto) {
    if (typeof texto !== 'string' || !texto.trim()) {
        throw new ErrorCodigoP('Escribe al menos una instrucción.');
    }
    const instrucciones = [];
    const etiquetas = new Map();
    const lineas = texto.replace(/\r/g, '').split('\n');
    for (let i = 0; i < lineas.length; i++) {
        const linea = i + 1;
        const limpia = lineas[i].replace(/(?:;|\/\/).*$/, '').trim();
        if (!limpia) continue;

        let instruccion;
        // Se admiten "Inicio:" y "LABEL Inicio" como etiquetas.
        if (/^[a-zA-Z_][\w]*:$/.test(limpia)) {
            instruccion = { op: 'LABEL', arg: limpia.slice(0, -1), linea };
        } else {
            const partes = limpia.split(/\s+/);
            const op = partes[0].toUpperCase();
            const necesitaArg = ['LOD', 'LIT', 'STO', 'JT', 'JMP', 'LABEL'].includes(op);
            if (!necesitaArg && !OPERACIONES.has(op)) {
                throw new ErrorCodigoP(`Instrucción desconocida: "${partes[0]}".`, linea);
            }
            if (partes.length !== (necesitaArg ? 2 : 1)) {
                throw new ErrorCodigoP(necesitaArg ? `${op} necesita exactamente un argumento.` : `${op} no recibe argumentos.`, linea);
            }
            const arg = necesitaArg ? partes[1].replace(/:$/, '') : null;
            if (['LOD', 'STO', 'JT', 'JMP', 'LABEL'].includes(op) && !VARIABLE.test(arg)) {
                throw new ErrorCodigoP(`El argumento de ${op} debe ser un identificador válido.`, linea);
            }
            if (op === 'LIT' && !NUMERO.test(arg)) {
                throw new ErrorCodigoP('LIT necesita un número, por ejemplo: LIT 5.', linea);
            }
            instruccion = { op, arg, linea };
        }
        if (instruccion.op === 'LABEL') {
            const nombre = instruccion.arg.toLowerCase();
            if (etiquetas.has(nombre)) {
                throw new ErrorCodigoP(`Etiqueta duplicada: ${instruccion.arg}.`, linea);
            }
            etiquetas.set(nombre, instrucciones.length);
        }
        instrucciones.push(instruccion);
    }
    if (!instrucciones.length) throw new ErrorCodigoP('No encontré instrucciones.');
    for (const ins of instrucciones) {
        if (['JT', 'JMP'].includes(ins.op) && !etiquetas.has(ins.arg.toLowerCase())) {
            throw new ErrorCodigoP(`La etiqueta ${ins.arg} no existe.`, ins.linea);
        }
    }
    return { instrucciones, etiquetas };
}

export function ejecutarCodigoP(programa, variablesIniciales = {}, opciones = {}) {
    const compilado = typeof programa === 'string' ? analizarCodigoP(programa) : programa;
    const { instrucciones, etiquetas } = compilado;
    const variables = { ...variablesIniciales };
    const pila = [];
    const historial = [];
    const limite = opciones.maxPasos ?? 2500;
    let pc = 0;
    let pasos = 0;
    const tomar = (ins) => {
        if (!pila.length) throw new ErrorCodigoP(`Pila insuficiente para ${ins.op}.`, ins.linea);
        return pila.pop();
    };
    while (pc < instrucciones.length) {
        if (++pasos > limite) {
            throw new ErrorCodigoP(`Se superó el límite de ${limite} pasos. Comprueba los saltos y ciclos.`, instrucciones[pc].linea);
        }
        const ins = instrucciones[pc];
        const paso = ins.linea;
        let siguiente = pc + 1;
        switch (ins.op) {
            case 'LIT': pila.push(Number(ins.arg)); break;
            case 'LOD': {
                if (!Object.prototype.hasOwnProperty.call(variables, ins.arg) || !Number.isFinite(variables[ins.arg])) {
                    throw new ErrorCodigoP(`La variable "${ins.arg}" no tiene valor definido.`, paso);
                }
                pila.push(variables[ins.arg]);
                break;
            }
            case 'STO': variables[ins.arg] = tomar(ins); break;
            case 'LABEL': break;
            case 'JMP': siguiente = etiquetas.get(ins.arg.toLowerCase()); break;
            case 'JT': {
                const condicion = tomar(ins);
                if (condicion !== 0) siguiente = etiquetas.get(ins.arg.toLowerCase());
                break;
            }
            case 'ADD': case 'SUB': case 'MUL': case 'DIV': case 'GT': case 'GE': {
                const b = tomar(ins);
                const a = tomar(ins);
                let res;
                if (ins.op === 'ADD') res = a + b;
                if (ins.op === 'SUB') res = a - b;
                if (ins.op === 'MUL') res = a * b;
                if (ins.op === 'DIV') {
                    if (Math.abs(b) < 1e-12) throw new ErrorCodigoP('División entre cero.', paso);
                    res = a / b;
                }
                if (ins.op === 'GT') res = a > b ? 1 : 0;
                if (ins.op === 'GE') res = a >= b ? 1 : 0;
                if (!Number.isFinite(res)) throw new ErrorCodigoP('Resultado numérico no válido.', paso);
                pila.push(res);
                break;
            }
        }
        if (opciones.guardarHistorial && historial.length < 180) {
            historial.push({ linea: ins.linea, instruccion: ins.op + (ins.arg == null ? '' : ` ${ins.arg}`), pila: [...pila], variables: { ...variables } });
        }
        pc = siguiente;
    }
    return { variables, pila, pasos, historial };
}
