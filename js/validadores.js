import { analizarCodigoP, ejecutarCodigoP, ErrorCodigoP } from './codigo-p.js';

const iguales = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 1e-8 * Math.max(1, Math.abs(a), Math.abs(b));
const descriptivo = (datos) => Object.entries(datos).map(([clave, valor]) => `${clave}=${valor}`).join(', ');

export function validarRespuesta(texto, ejercicio) {
    let compilado;
    try {
        compilado = analizarCodigoP(texto);
    } catch (error) {
        return { correcto: false, titulo: 'Error de instrucciones', detalle: error.message, comprobadas: 0 };
    }
    const pruebas = ejercicio.pruebas;
    for (let i = 0; i < pruebas.length; i++) {
        const datos = pruebas[i];
        let resultado;
        try {
            resultado = ejecutarCodigoP(compilado, ejercicio.inicializar(datos));
        } catch (error) {
            const detalle = error instanceof ErrorCodigoP ? error.message : `No se pudo ejecutar el programa: ${error.message}`;
            return { correcto: false, titulo: i === 0 ? 'Error al ejecutar' : 'Error en otra prueba', detalle: i === 0 ? detalle : `Con ${descriptivo(datos)}: ${detalle}`, comprobadas: i };
        }
        const esperado = ejercicio.calcularEsperado(datos);
        for (const variable of ejercicio.variablesSalida) {
            if (!iguales(resultado.variables[variable], esperado[variable])) {
                const observado = resultado.variables[variable] === undefined ? 'sin asignar' : resultado.variables[variable];
                return {
                    correcto: false,
                    titulo: i === 0 ? 'Resultado incorrecto' : 'No funciona con otros valores',
                    detalle: `Con ${descriptivo(datos)}, ${variable} debería ser ${esperado[variable]}, pero tu programa obtiene ${observado}. Revisa el orden de operandos, las condiciones y los saltos.`,
                    comprobadas: i
                };
            }
        }
        for (const variable of ejercicio.variablesConstantes) {
            if (!iguales(resultado.variables[variable], datos[variable])) {
                return { correcto: false, titulo: 'Variable de entrada modificada', detalle: `Tu programa cambió ${variable}, que solo debe utilizarse como entrada.`, comprobadas: i };
            }
        }
        if (resultado.pila.length !== 0) {
            return { correcto: false, titulo: 'La pila no quedó vacía', detalle: `Al terminar quedaron ${resultado.pila.length} valor(es) en la pila. Comprueba las operaciones y STO.`, comprobadas: i };
        }
    }
    return {
        correcto: true,
        titulo: '¡Respuesta correcta en las pruebas!',
        detalle: `Las instrucciones produjeron los resultados esperados en ${pruebas.length} conjuntos de valores. Se admiten distintas secuencias equivalentes; esto no sustituye una demostración formal para todos los casos.`,
        comprobadas: pruebas.length
    };
}

export function obtenerTraza(texto, ejercicio) {
    return ejecutarCodigoP(texto, ejercicio.inicializar(ejercicio.entradaVisible), { guardarHistorial: true }).historial;
}
