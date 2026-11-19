// Reloj local de Etriva. No necesita red ni permisos de ubicación.
const $ = (id) => document.getElementById(id);
const digital = $('reloj-digital');
const analogico = $('reloj-analogico');
const boton = $('reloj-cambiar');
const modoKey = 'etriva_reloj_modo_v1';
let modo = 'digital';
try { if (localStorage.getItem(modoKey) === 'analogico') modo = 'analogico'; } catch { /* Modo por defecto */ }

function pintarModo() {
  const analogo = modo === 'analogico';
  digital.hidden = analogo;
  analogico.hidden = !analogo;
  boton.textContent = analogo ? 'Digital ↗' : 'Analógico ↗';
  boton.setAttribute('aria-label', analogo ? 'Cambiar a reloj digital' : 'Cambiar a reloj analógico');
  boton.title = analogo ? 'Mostrar formato digital' : 'Mostrar formato analógico';
  actualizar();
}

function actualizar() {
  const ahora = new Date();
  $('reloj-hora').textContent = ahora.toLocaleTimeString('es-MX', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

pintarModo();
setInterval(actualizar, 1000);
