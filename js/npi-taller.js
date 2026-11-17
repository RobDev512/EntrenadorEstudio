/* NPI por árboles independientes: cada asignación incluye destino y signo =
   como raíz del árbol. Condiciones: árbol de comparación sin asignación.
   Postorden separado por comas; NPI separada por espacios. */
const NS = 'http://www.w3.org/2000/svg';
const OPERADORES = new Set(['+', '-', '*', '/', '<', '>', '<=', '>=']);
const BINARY = new Set([...OPERADORES, '=']);
const $ = id => document.getElementById(id);
const espacio = s => String(s ?? '').trim().split(/\s+/).filter(Boolean).join(' ');
function tokensConComas(valor) {
    const texto = String(valor ?? '').trim();
    if (!texto || texto.startsWith(',') || texto.endsWith(',') || /,,/.test(texto)) return null;
    const tokens = texto.split(',').map(s => s.trim());
    if (tokens.some(t => !t || /\s/.test(t))) return null;
    return tokens;
}
const rutaTexto = path => path ? `Raíz → ${[...path].map(d => d === 'I' ? 'izquierda' : 'derecha').join(' → ')}` : 'Raíz';
const nuevo = (token = '') => ({ token, izquierdo: null, derecho: null });
const clonar = node => node ? ({ token: node.token, izquierdo: clonar(node.izquierdo), derecho: clonar(node.derecho) }) : null;
function convertir(n) {
    if (n.tipo === 'var') return nuevo(n.nombre);
    if (n.tipo === 'num') return nuevo(String(n.valor));
    const r = nuevo(n.op); r.izquierdo = convertir(n.izquierdo); r.derecho = convertir(n.derecho);
    return r;
}
export function arbolCorrecto(etapa) {
    if (!etapa.destino) return convertir(etapa.arbol);
    const asignacion = nuevo('=');
    asignacion.izquierdo = nuevo(etapa.destino);
    asignacion.derecho = convertir(etapa.arbol);
    return asignacion;
}
export function tokensPostorden(nodo, salida = []) {
    if (!nodo || !nodo.token) throw new Error('Completa todos los nodos del árbol.');
    if (BINARY.has(nodo.token)) {
        if (!nodo.izquierdo || !nodo.derecho) throw new Error(`El operador «${nodo.token}» necesita dos hijos.`);
        tokensPostorden(nodo.izquierdo, salida); tokensPostorden(nodo.derecho, salida);
    } else if (nodo.izquierdo || nodo.derecho) throw new Error(`El operando «${nodo.token}» no puede tener hijos.`);
    salida.push(nodo.token);
    return salida;
}
export function compararArbol(real, esperado, ruta = 'raíz') {
    if (!real || !real.token) return `Falta completar un nodo en ${ruta}.`;
    if (real.token !== esperado.token) return `En ${ruta}, revisa «${real.token}»: según el código fuente, debe ser «${esperado.token}».`;
    if (BINARY.has(esperado.token)) {
        if (!real.izquierdo || !real.derecho) return `En ${ruta}, el operador «${esperado.token}» necesita ambas ramas.`;
        return compararArbol(real.izquierdo, esperado.izquierdo, `${ruta} → izquierda`)
            || compararArbol(real.derecho, esperado.derecho, `${ruta} → derecha`);
    }
    if (real.izquierdo || real.derecho) return `En ${ruta}, «${esperado.token}» es una hoja y no debe tener ramas.`;
    return '';
}
function mostrarReferencia(nodo, prefijo = '', tipo = 'Raíz', lineas = []) {
    lineas.push(`${prefijo}${tipo}: ${nodo.token}`);
    if (nodo.izquierdo) mostrarReferencia(nodo.izquierdo, prefijo + '  ', 'Izq.', lineas);
    if (nodo.derecho) mostrarReferencia(nodo.derecho, prefijo + '  ', 'Der.', lineas);
    return lineas;
}
export function referenciaCompletaNPI(etapas) {
    return etapas.map(etapa => {
        const correcto = arbolCorrecto(etapa);
        const tokens = tokensPostorden(correcto);
        const post = tokens.join(', ');
        const npi = tokens.join(' ');
        return `${etapa.clave} · ${etapa.descripcion}\nÁrbol completo:\n${mostrarReferencia(correcto).join('\n')}\nRecorrido postorden: ${post}\nNPI: ${npi}`;
    }).join('\n\n');
}
// Inventario FINITO del árbol seleccionado: cada ocurrencia cuenta,
// también cuando se repite una variable, constante u operador.
function contarFichas(nodo, conteo = new Map()) {
    if (!nodo) return conteo;
    if (nodo.token) conteo.set(nodo.token, (conteo.get(nodo.token) || 0) + 1);
    contarFichas(nodo.izquierdo, conteo);
    contarFichas(nodo.derecho, conteo);
    return conteo;
}
export function fichasDisponibles(etapa, raiz) {
    const previstas = contarFichas(arbolCorrecto(etapa));
    const colocadas = contarFichas(raiz);
    return new Map([...previstas.entries()].map(([token, cantidad]) =>
        [token, Math.max(0, cantidad - (colocadas.get(token) || 0))]));
}
function elegir(nodo, path) {
    let actual = nodo;
    for (const direccion of path) actual = direccion === 'I' ? actual?.izquierdo : actual?.derecho;
    return actual;
}
function nodos(nodo) { return nodo ? 1 + nodos(nodo.izquierdo) + nodos(nodo.derecho) : 0; }
function profundidad(nodo) { return nodo ? 1 + Math.max(profundidad(nodo.izquierdo), profundidad(nodo.derecho)) : 0; }

export class TallerNPI {
    constructor() {
        this.etapas = [];
        this.estados = [];
        this.indice = 0;
        this.seleccion = '';
        this.arrastre = null;
        this.ultimoDestino = null;
        this.suprimirClickHasta = 0;
        this.conectarEventos();
    }
    conectarEventos() {
        $('npi-etapa').addEventListener('change', e => { this.indice = Number(e.target.value); this.seleccion = ''; this.mostrar(); });
        $('npi-revisar-arbol').addEventListener('click', () => this.revisarArbol());
        $('npi-revisar-postorden').addEventListener('click', () => this.revisarPostorden());
        $('npi-revisar-npi').addEventListener('click', () => this.revisarNPI());
        $('npi-siguiente').addEventListener('click', () => {
            if (this.indice < this.etapas.length - 1) this.indice++;
            else this.indice = 0;
            this.seleccion = ''; this.mostrar();
        });
        $('npi-borrar-nodo').addEventListener('click', () => this.cambiarNodo(''));
        $('npi-reiniciar-arbol').addEventListener('click', () => {
            const estado = this.actual(); estado.raiz = nuevo(); this.seleccion = '';
            this.invalidar(estado); this.estadoMensaje('Árbol reiniciado. Comienza por la raíz.', 'info'); this.mostrar();
        });
        $('npi-postorden').addEventListener('input', e => {
            const est = this.actual(); est.postorden = e.target.value; est.postordenOK = false; est.npiOK = false; this.actualizarPasos();
        });
        $('npi-npi').addEventListener('input', e => { const est = this.actual(); est.npi = e.target.value; est.npiOK = false; this.actualizarPasos(); });
        // Arrastre táctil (dedo o lápiz): la API HTML5 drag/drop por sí sola
        // no funciona consistentemente en Android/iOS.
        document.addEventListener('pointermove', e => this.moverFichaTactil(e), { passive:false });
        document.addEventListener('pointerup', e => this.soltarFichaTactil(e));
        document.addEventListener('pointercancel', () => this.finalizarArrastreTactil());
    }
    cargar(etapas) {
        this.finalizarArrastreTactil();
        this.etapas = etapas;
        this.estados = etapas.map(() => ({ raiz: nuevo(), arbolOK: false, postorden: '', postordenOK: false, npi: '', npiOK: false, mensaje: '' }));
        this.indice = 0; this.seleccion = '';
        const sel = $('npi-etapa'); sel.replaceChildren();
        etapas.forEach((etapa, i) => {
            const opt = document.createElement('option'); opt.value = String(i);
            opt.textContent = `${i+1}. ${etapa.descripcion}`; sel.append(opt);
        });
        this.mostrar();
    }
    actual() { return this.estados[this.indice]; }
    invalidar(estado) { estado.arbolOK = false; estado.postordenOK = false; estado.npiOK = false; }
    cambiarNodo(token, ruta = this.seleccion) {
        const estado = this.actual(), nodo = elegir(estado.raiz, ruta);
        if (!nodo) return false;
        if (token && !this.fichaUtilizable(token, ruta)) {
            this.estadoMensaje(`No quedan fichas «${token}» disponibles para este árbol. Vacía o cambia otro nodo primero.`, 'error');
            return false;
        }
        if (token && BINARY.has(token) && profundidad(estado.raiz) >= 9 && !BINARY.has(nodo.token)) {
            this.estadoMensaje('El árbol alcanzó la profundidad máxima (9 niveles).', 'error'); return false;
        }
        const anterior = clonar(nodo);
        nodo.token = token;
        if (BINARY.has(token)) {
            if (!nodo.izquierdo) nodo.izquierdo = nuevo();
            if (!nodo.derecho) nodo.derecho = nuevo();
        } else { nodo.izquierdo = null; nodo.derecho = null; }
        if (nodos(estado.raiz) > 45) {
            Object.assign(nodo, anterior);
            this.estadoMensaje('Máximo de 45 nodos por árbol.', 'error'); return false;
        }
        this.seleccion = ruta;
        this.invalidar(estado);
        this.mostrar();
        return true;
    }
    fichaUtilizable(token, ruta) {
        if (!token) return true;
        const saldo = fichasDisponibles(this.etapas[this.indice], this.actual().raiz);
        // Reemplazar un nodo devuelve todas las fichas de su subárbol.
        const viejo = elegir(this.actual().raiz, ruta);
        const recuperadas = contarFichas(viejo);
        return (saldo.get(token) || 0) + (recuperadas.get(token) || 0) > 0;
    }
    dibujarArbol() {
        const contenedor = $('npi-arbol'); contenedor.replaceChildren();
        const raiz = this.actual().raiz;
        const posicion = new Map(); let contadorHojas = 0, maxProf = 0;
        const recorrer = (nodo, depth, path) => {
            maxProf = Math.max(maxProf, depth);
            const izq = nodo.izquierdo ? recorrer(nodo.izquierdo, depth+1, path+'I') : null;
            const der = nodo.derecho ? recorrer(nodo.derecho, depth+1, path+'D') : null;
            const x = izq && der ? (izq + der) / 2 : 62 + contadorHojas++ * 100;
            posicion.set(path, { x, y: 48 + depth * 92, nodo, path });
            return x;
        };
        recorrer(raiz, 0, '');
        const xs = [...posicion.values()].map(p => p.x);
        const width = Math.max(410, Math.max(...xs, 0) + 75);
        const height = 94 + maxProf * 92;
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height));
        svg.setAttribute('class','npi-svg'); svg.setAttribute('aria-label','Árbol editable; selecciona un círculo para cambiarlo');
        const el = (tag, attrs, parent = svg) => {
            const item = document.createElementNS(NS, tag);
            for (const [k,v] of Object.entries(attrs)) item.setAttribute(k, String(v));
            parent.append(item); return item;
        };
        for (const p of posicion.values()) {
            for (const sufijo of ['I','D']) {
                const hijo = posicion.get(p.path+sufijo);
                if (hijo) el('line', { x1:p.x,y1:p.y+22,x2:hijo.x,y2:hijo.y-22,class:'npi-rama' });
            }
        }
        for (const p of posicion.values()) {
            const grupo = el('g', { class:`npi-nodo ${this.seleccion === p.path ? 'seleccionado' : ''} ${p.nodo.token ? '' : 'pendiente'}`, role:'button',tabindex:0,'data-npi-path':p.path,'aria-label':`${rutaTexto(p.path)}: ${p.nodo.token || 'sin completar'}. Puedes soltar una ficha aquí.` });
            el('circle', { cx:p.x,cy:p.y,r:25 }, grupo);
            const txt = el('text', { x:p.x,y:p.y+5,'text-anchor':'middle' }, grupo);
            txt.textContent = p.nodo.token || '?';
            grupo.addEventListener('click', () => {
                if (Date.now() < this.suprimirClickHasta) return;
                this.seleccion = p.path; this.dibujarArbol();
            });
            grupo.addEventListener('pointerdown', e => {
                if (p.nodo.token) this.iniciarFichaTactil(e, p.nodo.token, 'arbol', p.path);
            });
            grupo.addEventListener('dragover', e => {
                if (!this.tokenArrastrado) return;
                e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
                grupo.classList.add('npi-destino-arrastre');
            });
            grupo.addEventListener('dragleave', () => grupo.classList.remove('npi-destino-arrastre'));
            grupo.addEventListener('drop', e => {
                e.preventDefault(); e.stopPropagation();
                const token = e.dataTransfer.getData('text/plain') || this.tokenArrastrado;
                this.tokenArrastrado = null;
                if (token) this.cambiarNodo(token, p.path);
            });
            grupo.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.seleccion=p.path; this.dibujarArbol(); }
            });
        }
        contenedor.append(svg);
        $('npi-ruta').textContent = rutaTexto(this.seleccion);
    }
    paleta() {
        const paleta = $('npi-paleta'); paleta.replaceChildren();
        const disponibles = fichasDisponibles(this.etapas[this.indice], this.actual().raiz);
        const orden = [...disponibles.entries()].sort(([a], [b]) =>
            Number(BINARY.has(a)) - Number(BINARY.has(b)) || a.localeCompare(b, 'es'));
        for (const [token, cantidad] of orden) {
            // Una ficha agotada deja su casilla vacía: no puede seleccionarse,
            // pero puedes devolverle el elemento arrastrándolo desde el árbol.
            const casilla = document.createElement('div');
            casilla.className = `npi-casilla ${cantidad ? '' : 'npi-agotada'}`;
            casilla.dataset.npiInventario = token;
            casilla.title = `Casilla original de «${token}». Arrastra aquí un nodo para devolverlo.`;
            const boton = document.createElement('button'); boton.type = 'button';
            boton.className = `npi-ficha ${BINARY.has(token) ? 'npi-operador' : ''}`;
            boton.draggable = cantidad > 0;
            boton.disabled = cantidad === 0;
            boton.dataset.token = token;
            boton.title = cantidad ? `Arrastra «${token}» al árbol o pulsa para colocarlo` : `Sin fichas «${token}» disponibles. Devuelve su nodo al inventario.`;
            const texto = document.createElement('span'); texto.className = 'npi-ficha-texto'; texto.textContent = token;
            boton.append(texto);
            if (cantidad !== 1 || this.cantidadOriginal(token) > 1) {
                const cantidadEl = document.createElement('span'); cantidadEl.className = 'npi-ficha-cantidad';
                cantidadEl.textContent = `×${cantidad}`;
                cantidadEl.setAttribute('aria-label', `${cantidad} disponibles`);
                boton.append(cantidadEl);
            }
            if (cantidad > 0) {
                boton.addEventListener('click', () => {
                    if (Date.now() < this.suprimirClickHasta) return;
                    this.cambiarNodo(token);
                });
                boton.addEventListener('dragstart', e => {
                    if (!e.dataTransfer) return;
                    this.tokenArrastrado = token;
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData('text/plain', token);
                    boton.classList.add('npi-ficha-arrastrando');
                });
                boton.addEventListener('dragend', () => {
                    this.tokenArrastrado = null;
                    boton.classList.remove('npi-ficha-arrastrando');
                    $('npi-arbol').querySelectorAll('.npi-destino-arrastre').forEach(n => n.classList.remove('npi-destino-arrastre'));
                });
                boton.addEventListener('pointerdown', e => this.iniciarFichaTactil(e, token, 'paleta'));
            }
            casilla.append(boton);
            paleta.append(casilla);
        }
        const contador = $('npi-inventario-estado');
        if (contador) {
            const total = [...disponibles.values()].reduce((a,b) => a+b,0);
            contador.textContent = `${total} ${total === 1 ? 'ficha disponible' : 'fichas disponibles'}`;
        }
    }
    cantidadOriginal(token) {
        return contarFichas(arbolCorrecto(this.etapas[this.indice])).get(token) || 0;
    }
    iniciarFichaTactil(e, token, origen = 'paleta', ruta = '') {
        // En escritorio las fichas de la paleta usan drag/drop nativo.
        // Los nodos SVG usan Pointer Events incluso con ratón: SVG <g>
        // no inicia drag nativo de forma fiable entre navegadores.
        if ((e.pointerType === 'mouse' && origen === 'paleta') || e.button !== 0) return;
        this.finalizarArrastreTactil();
        this.arrastre = { id:e.pointerId, token, origen, ruta,
            origenX:e.clientX, origenY:e.clientY,
            x:e.clientX, y:e.clientY, activo:false, fantasma:null };
    }
    moverFichaTactil(e) {
        const a = this.arrastre;
        if (!a || a.id !== e.pointerId) return;
        a.x = e.clientX; a.y = e.clientY;
        if (!a.activo && Math.hypot(e.clientX-a.origenX, e.clientY-a.origenY) > 7) {
            a.activo = true;
            const fantasma = document.createElement('div');
            fantasma.className = 'npi-ficha-fantasma'; fantasma.textContent = a.token;
            document.body.append(fantasma); a.fantasma = fantasma;
            this.suprimirClickHasta = Date.now() + 900;
            this.autoScrollTactil();
        }
        if (!a.activo) return;
        e.preventDefault();
        a.fantasma.style.transform = `translate(${e.clientX+13}px,${e.clientY-24}px)`;
        this.actualizarDestinoTactil(e.clientX,e.clientY);
    }
    actualizarDestinoTactil(x,y) {
        const anterior = this.ultimoDestino;
        const elemento = document.elementFromPoint(x,y);
        const destino = this.arrastre?.origen === 'arbol'
            ? elemento?.closest?.('#npi-paleta')
            : elemento?.closest?.('[data-npi-path]');
        if (anterior !== destino) {
            anterior?.classList.remove('npi-destino-arrastre','npi-paleta-destino');
            destino?.classList.add(this.arrastre?.origen === 'arbol' ? 'npi-paleta-destino' : 'npi-destino-arrastre');
            this.ultimoDestino = destino || null;
        }
    }
    autoScrollTactil() {
        const avanzar = () => {
            const a = this.arrastre;
            if (!a?.activo) return;
            const borde = 85;
            let velocidad = a.y < borde ? -Math.min(18,(borde-a.y)/4)
                : a.y > window.innerHeight-borde ? Math.min(18,(a.y-(window.innerHeight-borde))/4) : 0;
            if (velocidad) {
                const zona = $('npi-arbol');
                const area = zona.getBoundingClientRect();
                // Cuando el árbol tiene scroll horizontal el usuario puede
                // moverlo manualmente; este autoscroll es sólo vertical.
                window.scrollBy(0,velocidad);
                this.actualizarDestinoTactil(a.x,a.y);
            }
            this.animacionArrastre = requestAnimationFrame(avanzar);
        };
        this.animacionArrastre = requestAnimationFrame(avanzar);
    }
    soltarFichaTactil(e) {
        const a = this.arrastre;
        if (!a || a.id !== e.pointerId) return;
        if (a.activo) {
            const elemento = document.elementFromPoint(e.clientX,e.clientY);
            const destino = elemento?.closest?.('[data-npi-path]');
            const sobreInventario = Boolean(elemento?.closest?.('#npi-paleta'));
            const ruta = destino?.getAttribute('data-npi-path');
            const token = a.token;
            this.finalizarArrastreTactil();
            this.suprimirClickHasta = Date.now() + 650;
            if (a.origen === 'arbol') {
                if (sobreInventario) this.cambiarNodo('', a.ruta);
                else this.estadoMensaje('Arrastra el nodo hasta su casilla del inventario para devolverlo.', 'info');
            } else if (ruta !== null && ruta !== undefined) this.cambiarNodo(token,ruta);
            else this.estadoMensaje('Suelta la ficha encima de un círculo del árbol. También puedes tocar ficha y nodo.', 'info');
        } else this.finalizarArrastreTactil();
    }
    finalizarArrastreTactil() {
        if (this.animacionArrastre) cancelAnimationFrame(this.animacionArrastre);
        this.animacionArrastre = null;
        this.arrastre?.fantasma?.remove();
        this.ultimoDestino?.classList.remove('npi-destino-arrastre','npi-paleta-destino');
        this.ultimoDestino = null;
        this.arrastre = null;
    }
    estadoMensaje(texto, clase = 'info') {
        const el = $('npi-mensaje-arbol'); el.textContent = texto; el.dataset.estado = clase;
    }
    mostrar() {
        const estado = this.actual(), etapa = this.etapas[this.indice];
        $('npi-etapa').value = String(this.indice);
        $('npi-descripcion').textContent = etapa.destino
            ? `Árbol ${this.indice+1} de ${this.etapas.length}: construye la ASIGNACIÓN completa con = como raíz, ${etapa.destino} a su izquierda y la expresión a su derecha.`
            : `Árbol ${this.indice+1} de ${this.etapas.length}: construye la condición original de «${etapa.descripcion}», sin invertir el comparador.`;
        this.dibujarArbol(); this.paleta();
        $('npi-postorden').value = estado.postorden;
        $('npi-npi').value = estado.npi;
        this.estadoMensaje(estado.arbolOK ? '✓ Árbol correcto. Ya puedes escribir el recorrido postorden.' : '', estado.arbolOK ? 'ok' : 'info');
        $('npi-mensaje-postorden').textContent = estado.postordenOK ? '✓ Recorrido correcto.' : '';
        $('npi-mensaje-npi').textContent = estado.npiOK ? '✓ NPI correcta para esta etapa.' : '';
        $('npi-siguiente').textContent = this.indice === this.etapas.length-1 ? 'Volver al primer árbol' : 'Siguiente árbol →';
        $('npi-postorden').placeholder = etapa.destino ? `Ejemplo: ${etapa.destino}, a, b, +, =` : 'Ejemplo: a, b, >';
        $('npi-npi').placeholder = etapa.destino ? `Ejemplo: ${etapa.destino} a b + =` : 'Ejemplo: a b >';
        this.actualizarPasos();
    }
    actualizarPasos() {
        const est = this.actual();
        $('npi-postorden').disabled = !est.arbolOK;
        $('npi-revisar-postorden').disabled = !est.arbolOK;
        $('npi-npi').disabled = !est.postordenOK;
        $('npi-revisar-npi').disabled = !est.postordenOK;
        for (const [id,ok] of [['arbol',est.arbolOK],['postorden',est.postordenOK],['npi',est.npiOK]]) {
            const bloque = $(`npi-paso-${id}`); bloque.classList.toggle('aprobado', ok);
        }
        const hechos = this.estados.filter(s => s.npiOK).length;
        $('npi-progreso').textContent = `${hechos} de ${this.etapas.length} árboles completados`;
        $('npi-barra').style.width = `${100 * hechos/this.etapas.length}%`;
        [...$('npi-etapa').options].forEach((opt,i) => {
            opt.textContent = `${this.estados[i].npiOK ? '✓ ' : ''}${i+1}. ${this.etapas[i].descripcion}`;
        });
        this.mostrarGaleria();
    }
    // Todos los árboles del programa se ven simultáneamente en la galería.
    // Cada tarjeta conserva su propio árbol, postorden y NPI.
    mostrarGaleria() {
        const contenedor = $('npi-galeria');
        if (!contenedor) return;
        contenedor.replaceChildren();
        $('npi-cantidad').textContent = `${this.etapas.length} ${this.etapas.length === 1 ? 'árbol' : 'árboles'} para este código fuente`;
        this.etapas.forEach((etapa, i) => {
            const estado = this.estados[i];
            const card = document.createElement('button'); card.type='button';
            card.className = `npi-tarjeta-arbol ${i === this.indice ? 'activo' : ''} ${estado.npiOK ? 'completo' : ''}`;
            card.setAttribute('aria-pressed', String(i === this.indice));
            const titulo = document.createElement('strong');
            titulo.textContent = `${i+1}. ${etapa.descripcion}`;
            const expresion = document.createElement('span');
            expresion.className = 'npi-expresion-fuente';
            expresion.textContent = etapa.destino ? `${etapa.destino} = ${this.expresionLegible(etapa.arbol)}` : this.expresionLegible(etapa.arbol);
            const visor = this.previsualizar(estado.raiz);
            const estadoVisual = document.createElement('span');
            estadoVisual.className = 'npi-estado-arbol';
            estadoVisual.textContent = estado.npiOK ? '✓ Árbol + postorden + NPI' : estado.postordenOK ? 'Postorden listo · falta NPI' : estado.arbolOK ? 'Árbol correcto · falta postorden' : 'Pendiente · pulsa para editar';
            card.append(titulo, expresion, visor, estadoVisual);
            card.addEventListener('click', () => {
                if (this.indice !== i) {
                    this.indice = i; this.seleccion = ''; this.mostrar();
                    $('npi-paso-arbol').scrollIntoView({behavior:'smooth',block:'nearest'});
                }
            });
            contenedor.append(card);
        });
    }
    expresionLegible(n) {
        if (n.tipo === 'var') return n.nombre;
        if (n.tipo === 'num') return String(n.valor);
        return `(${this.expresionLegible(n.izquierdo)} ${n.op} ${this.expresionLegible(n.derecho)})`;
    }
    previsualizar(raiz) {
        const panel = document.createElement('div'); panel.className = 'npi-mini-visor';
        const puntos = [];
        let indiceHoja = 0;
        const visitar = (n, nivel, ruta) => {
            let izquierda = null, derecha = null;
            if (n.izquierdo) izquierda = visitar(n.izquierdo, nivel+1, ruta+'I');
            if (n.derecho) derecha = visitar(n.derecho, nivel+1, ruta+'D');
            const x = izquierda !== null && derecha !== null ? (izquierda + derecha)/2 : 30 + 68*indiceHoja++;
            puntos.push({x, y:27+nivel*54, token:n.token || '?', ruta, hijos:[n.izquierdo ? ruta+'I' : null,n.derecho ? ruta+'D' : null].filter(Boolean)});
            return x;
        };
        visitar(raiz, 0, '');
        const ancho = Math.max(130, ...puntos.map(p=>p.x+35));
        const alto = Math.max(64, ...puntos.map(p=>p.y+34));
        const svg = document.createElementNS(NS,'svg');
        svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
        svg.setAttribute('aria-hidden','true');
        const lookup = new Map(puntos.map(p=>[p.ruta,p]));
        for (const punto of puntos) for (const ruta of punto.hijos) {
            const hijo = lookup.get(ruta);
            if (!hijo) continue;
            const linea=document.createElementNS(NS,'line');
            for (const [k,v] of Object.entries({x1:punto.x,y1:punto.y+12,x2:hijo.x,y2:hijo.y-12})) linea.setAttribute(k,String(v));
            svg.append(linea);
        }
        for (const punto of puntos) {
            const circulo=document.createElementNS(NS,'circle');
            circulo.setAttribute('cx',String(punto.x)); circulo.setAttribute('cy',String(punto.y)); circulo.setAttribute('r','15'); svg.append(circulo);
            const texto=document.createElementNS(NS,'text');
            texto.setAttribute('x',String(punto.x)); texto.setAttribute('y',String(punto.y+4)); texto.setAttribute('text-anchor','middle'); texto.textContent=punto.token; svg.append(texto);
        }
        panel.append(svg); return panel;
    }
    revisarArbol() {
        const est = this.actual(), etapa = this.etapas[this.indice];
        const error = compararArbol(est.raiz, arbolCorrecto(etapa));
        est.arbolOK = !error;
        if (error) { est.postordenOK = false; est.npiOK = false; }
        this.estadoMensaje(error || '✓ Árbol correcto. Sigue con izquierda → derecha → raíz.', error ? 'error' : 'ok');
        this.actualizarPasos(); return !error;
    }
    revisarPostorden() {
        const est = this.actual(); if (!est.arbolOK) return false;
        const esperado = tokensPostorden(arbolCorrecto(this.etapas[this.indice]));
        const ingresados = tokensConComas(est.postorden);
        const correcto = ingresados !== null && ingresados.length === esperado.length
            && ingresados.every((token,i) => token === esperado[i]);
        est.postordenOK = correcto;
        if (!correcto) est.npiOK = false;
        $('npi-mensaje-postorden').textContent = correcto ? '✓ Recorrido correcto.' : 'Separa cada elemento con una coma. Recorre izquierda, derecha y raíz; si es asignación, incluye el destino y «=».';
        this.actualizarPasos(); return correcto;
    }
    revisarNPI() {
        const est = this.actual(); if (!est.postordenOK) return false;
        const etapa = this.etapas[this.indice];
        const esperado = tokensPostorden(arbolCorrecto(etapa)).join(' ');
        const correcto = espacio(est.npi) === esperado;
        est.npiOK = correcto;
        $('npi-mensaje-npi').textContent = correcto ? '✓ NPI correcta. Puedes pasar al siguiente árbol.' : this.etapas[this.indice].destino ? 'Para la asignación: destino + expresión + = (en NPI los símbolos van separados por espacios).' : 'La NPI de la condición coincide con su postorden. Separa los símbolos con espacios.';
        this.actualizarPasos(); return correcto;
    }
    terminado() { return this.estados.length > 0 && this.estados.every(s => s.arbolOK && s.postordenOK && s.npiOK); }
    pendiente() {
        const idx = this.estados.findIndex(s => !s.npiOK);
        return idx < 0 ? '' : `Falta completar el árbol ${idx+1}: ${this.etapas[idx].descripcion}. Termina árbol, recorrido y NPI.`;
    }
    textoParaValidar() {
        return this.estados.map((e,i) => `${this.etapas[i].clave}: ${espacio(e.npi)}`).join('\n');
    }
    ponerSolucion() {
        this.estados.forEach((e,i) => {
            e.raiz = clonar(arbolCorrecto(this.etapas[i]));
            e.postorden = tokensPostorden(e.raiz).join(', ');
            e.npi = tokensPostorden(e.raiz).join(' ');
            e.arbolOK = false; e.postordenOK = false; e.npiOK = false;
        });
        this.seleccion = ''; this.mostrar();
    }
    limpiarEtapa() {
        const est = this.actual(); est.raiz = nuevo(); est.postorden = ''; est.npi = '';
        this.invalidar(est); this.seleccion = ''; this.mostrar();
    }
}
