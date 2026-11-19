// Reloj local de Etriva. No necesita red ni permisos de ubicación.
const $ = (id) => document.getElementById(id);
const digital = $('reloj-digital');
const analogico = $('reloj-analogico');
const boton = $('reloj-cambiar');
const botonFormato = $('reloj-formato');
const icono = $('reloj-icono');
const esfera = $('reloj-esfera');
const modoKey = 'etriva_reloj_modo_v1';
const formatoKey = 'etriva_reloj_formato_v1';
const formatos = ['24h', '12h', '12h-seg'];
let modo = 'digital';
let formato = '12h-seg';
try { if (localStorage.getItem(modoKey) === 'analogico') modo = 'analogico'; } catch { /* Modo por defecto */ }
try { const guardado = localStorage.getItem(formatoKey); if (formatos.includes(guardado)) formato = guardado; } catch { /* Formato por defecto */ }

function pad(n) { return String(n).padStart(2, '0'); }

function construirEsfera() {
  if (!esfera || esfera.dataset.lista) return;
  esfera.innerHTML = '';
  for (let i = 1; i <= 12; i++) {
    const num = document.createElement('span');
    num.className = 'reloj-num';
    num.textContent = String(i);
    const ang = (i * 30 - 90) * Math.PI / 180;
    num.style.left = `${50 + Math.cos(ang) * 38}%`;
    num.style.top = `${50 + Math.sin(ang) * 38}%`;
    esfera.append(num);
  }
  for (let i = 0; i < 60; i++) {
    const marca = document.createElement('span');
    marca.className = `reloj-marca${i % 5 === 0 ? ' principal' : ''}`;
    const ang = (i * 6 - 90) * Math.PI / 180;
    const radio = i % 5 === 0 ? 44 : 46;
    marca.style.left = `${50 + Math.cos(ang) * radio}%`;
    marca.style.top = `${50 + Math.sin(ang) * radio}%`;
    marca.style.transform = `translate(-50%, -50%) rotate(${i * 6}deg)`;
    esfera.append(marca);
  }
  const h = document.createElement('div'); h.className = 'reloj-manecilla reloj-h'; h.id = 'reloj-h';
  const m = document.createElement('div'); m.className = 'reloj-manecilla reloj-m'; m.id = 'reloj-m';
  const s = document.createElement('div'); s.className = 'reloj-manecilla reloj-s'; s.id = 'reloj-s';
  const c = document.createElement('div'); c.className = 'reloj-centro';
  esfera.append(h, m, s, c);
  esfera.dataset.lista = '1';
}

function etiquetaFormato() {
  if (formato === '24h') return '24H';
  if (formato === '12h') return '12H';
  return '12H+';
}

function pintarModo() {
  const analogo = modo === 'analogico';
  digital.hidden = analogo;
  analogico.hidden = !analogo;
  botonFormato.hidden = analogo;
  botonFormato.textContent = etiquetaFormato();
  icono.className = `icono-reloj ${analogo ? 'icono-analogico' : 'icono-digital'}`;
  boton.setAttribute('aria-label', analogo ? 'Cambiar a reloj digital' : 'Cambiar a reloj analógico');
  boton.title = analogo ? 'Mostrar reloj digital' : 'Mostrar reloj analógico';
  actualizar();
}

function formatearDigital(ahora) {
  const horas24 = ahora.getHours();
  const minutos = pad(ahora.getMinutes());
  const segundos = pad(ahora.getSeconds());
  if (formato === '24h') {
    return { hora: `${pad(horas24)}:${minutos}`, periodo: '', aria: `${pad(horas24)}:${minutos}` };
  }
  const periodo = horas24 >= 12 ? 'PM' : 'AM';
  const horas12 = horas24 % 12 || 12;
  if (formato === '12h') {
    return { hora: `${pad(horas12)}:${minutos}`, periodo, aria: `${pad(horas12)}:${minutos} ${periodo}` };
  }
  return { hora: `${pad(horas12)}:${minutos}:${segundos}`, periodo, aria: `${pad(horas12)}:${minutos}:${segundos} ${periodo}` };
}

function actualizar() {
  const ahora = new Date();
  const vis = formatearDigital(ahora);
  $('reloj-hora').textContent = vis.hora;
  $('reloj-periodo').textContent = vis.periodo;
  $('reloj-periodo').hidden = !vis.periodo;
  $('reloj-fecha').textContent = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(ahora);
  const hora = ahora.getHours() % 12 + ahora.getMinutes() / 60 + ahora.getSeconds() / 3600;
  const minuto = ahora.getMinutes() + ahora.getSeconds() / 60;
  const segundo = ahora.getSeconds() + ahora.getMilliseconds() / 1000;
  $('reloj-h').style.transform = `translateX(-50%) rotate(${hora * 30}deg)`;
  $('reloj-m').style.transform = `translateX(-50%) rotate(${minuto * 6}deg)`;
  $('reloj-s').style.transform = `translateX(-50%) rotate(${segundo * 6}deg)`;
  analogico.setAttribute('aria-label', `Reloj analógico: ${vis.aria}`);
}

boton.addEventListener('click', () => {
  modo = modo === 'digital' ? 'analogico' : 'digital';
  try { localStorage.setItem(modoKey, modo); } catch { /* Sigue funcionando sin persistencia */ }
  pintarModo();
});

botonFormato.addEventListener('click', () => {
  const indice = (formatos.indexOf(formato) + 1) % formatos.length;
  formato = formatos[indice];
  try { localStorage.setItem(formatoKey, formato); } catch { /* Sigue funcionando sin persistencia */ }
  botonFormato.textContent = etiquetaFormato();
  actualizar();
});

construirEsfera();
pintarModo();
setInterval(actualizar, 1000);
