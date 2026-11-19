// Reloj local de Etriva. No necesita red ni permisos de ubicación.
const $ = (id) => document.getElementById(id);
const digital = $('reloj-digital');
const analogico = $('reloj-analogico');
const boton = $('reloj-cambiar');
const icono = $('reloj-icono');
const esfera = $('reloj-esfera');
const modoKey = 'etriva_reloj_modo_v1';
let modo = 'digital';
try { if (localStorage.getItem(modoKey) === 'analogico') modo = 'analogico'; } catch { /* Modo por defecto */ }

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

function pintarModo() {
  const analogo = modo === 'analogico';
  digital.hidden = analogo;
  analogico.hidden = !analogo;
  icono.className = `icono-reloj ${analogo ? 'icono-analogico' : 'icono-digital'}`;
  boton.setAttribute('aria-label', analogo ? 'Cambiar a reloj digital' : 'Cambiar a reloj analógico');
  boton.title = analogo ? 'Mostrar reloj digital' : 'Mostrar reloj analógico';
  actualizar();
}

function actualizar() {
  const ahora = new Date();
  $('reloj-hora').textContent = ahora.toLocaleTimeString('es-MX', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  $('reloj-fecha').textContent = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(ahora);
  const hora = ahora.getHours() % 12 + ahora.getMinutes() / 60 + ahora.getSeconds() / 3600;
  const minuto = ahora.getMinutes() + ahora.getSeconds() / 60;
  const segundo = ahora.getSeconds() + ahora.getMilliseconds() / 1000;
  $('reloj-h').style.transform = `translateX(-50%) rotate(${hora * 30}deg)`;
  $('reloj-m').style.transform = `translateX(-50%) rotate(${minuto * 6}deg)`;
  $('reloj-s').style.transform = `translateX(-50%) rotate(${segundo * 6}deg)`;
  analogico.setAttribute('aria-label', `Reloj analógico: ${$('reloj-hora').textContent}`);
}

boton.addEventListener('click', () => {
  modo = modo === 'digital' ? 'analogico' : 'digital';
  try { localStorage.setItem(modoKey, modo); } catch { /* Sigue funcionando sin persistencia */ }
  pintarModo();
});

construirEsfera();
pintarModo();
setInterval(actualizar, 1000);
