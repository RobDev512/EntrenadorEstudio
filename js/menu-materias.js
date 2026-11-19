import { SEMESTRES, COMPLEMENTARIOS } from './catalogo-isc.js';

const CLAVE_ACTIVA = 'SCD-1016';
const NORMALIZAR = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function crear(tag, clase, texto) {
  const el = document.createElement(tag);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

/** Catálogo informativo: solo LyAII U2 está habilitada para practicar. */
export function montarMenuMaterias() {
  const nav = document.getElementById('catalogo-materias');
  const entrada = document.getElementById('buscar-materia');
  const contenedor = document.getElementById('catalogo-contenedor');
  if (!nav || !entrada || !contenedor) return;

  // En móviles abrimos el plan bajo demanda; en escritorio queda disponible.
  if (window.matchMedia('(max-width: 650px)').matches) contenedor.open = false;
  const abiertos = new Set([7]);
  const materiasAbiertas = new Set([CLAVE_ACTIVA]);
  const subtotal = SEMESTRES.reduce((acum, semestre) => acum + semestre.creditos, 0);
  const otros = COMPLEMENTARIOS.reduce((acum, concepto) => acum + concepto.creditos, 0);
  document.getElementById('total-creditos-materias').textContent = `${subtotal} cr.`;
  document.getElementById('plan-total-creditos').textContent = `${subtotal + otros} cr.`;
  document.getElementById('creditos-complementarios').textContent = COMPLEMENTARIOS.map(x => `${x.nombre}: ${x.creditos}`).join(' · ');
  if (subtotal !== 235 || subtotal + otros !== 260) console.warn('Revisar suma de créditos del plan de estudios.');

  function renderizar() {
    const consulta = NORMALIZAR(entrada.value.trim());
    nav.replaceChildren();
    let visibles = 0;

    SEMESTRES.forEach(semestre => {
      const materias = semestre.materias.filter(m => !consulta || NORMALIZAR(`${m.nombre} ${m.clave} semestre ${semestre.semestre}`).includes(consulta));
      if (!materias.length) return;
      visibles += materias.length;
      const grupo = crear('details', 'menu-semestre');
      grupo.open = consulta ? true : abiertos.has(semestre.semestre);
      grupo.addEventListener('toggle', () => {
        if (consulta) return;
        if (grupo.open) abiertos.add(semestre.semestre);
        else abiertos.delete(semestre.semestre);
      });
      const tituloSem = crear('summary','menu-semestre-cabecera');
      tituloSem.append(crear('span','menu-semestre-nombre',`Semestre ${semestre.semestre}`));
      const resumenSem = `${materias.length} mat. · ${materias.reduce((s,m)=>s+m.creditos,0)} cr.`;
      tituloSem.append(crear('span','menu-semestre-contador',resumenSem));
      grupo.append(tituloSem);
      const lista = crear('div','menu-lista-materias');

      materias.forEach(materia => {
        const activa = materia.clave === CLAVE_ACTIVA;
        const curso = crear('details',`menu-materia ${activa ? 'con-actividad':'sin-actividad'}`);
        curso.open = consulta ? true : materiasAbiertas.has(materia.clave);
        curso.addEventListener('toggle', () => {
          if (consulta) return;
          if (curso.open) materiasAbiertas.add(materia.clave);
          else materiasAbiertas.delete(materia.clave);
        });
        const resumen = crear('summary','menu-materia-cabecera');
        resumen.append(crear('span', 'menu-materia-icono', activa ? '◈' : '🔒'));
        const info = crear('span','menu-materia-info');
        info.append(crear('span','menu-materia-nombre',materia.nombre));
        info.append(crear('span','menu-materia-clave',`${materia.clave} · ${materia.creditos} créditos · ${materia.numeroUnidades} unidades`));
        if (materia.clavePortal) curso.title = `Clave en el documento: ${materia.clave}. Referencia en el portal: ${materia.clavePortal}.`;
        resumen.append(info);
        curso.append(resumen);
        const unidades = crear('div','menu-unidades');
        if (!materia.unidades.length) {
          unidades.append(crear('p','menu-sin-unidades','Unidades por incorporar'));
        } else {
          materia.unidades.forEach(unidad => {
            const boton = crear('button', `menu-unidad ${unidad.disponible ? 'habilitada' : 'deshabilitada'}`, `Unidad ${unidad.numero}`);
            boton.type = 'button';
            if (unidad.disponible) {
              boton.append(crear('span', 'menu-unidad-estado', 'Disponible'));
              boton.setAttribute('aria-current','page');
              boton.addEventListener('click', () => {
                document.getElementById('tarjeta-ejercicio')?.scrollIntoView({behavior:'smooth',block:'start'});
                if (window.matchMedia('(max-width: 650px)').matches) contenedor.open = false;
              });
            } else {
              boton.disabled = true;
              boton.title = 'Esta unidad todavía no tiene ejercicios';
              boton.append(crear('span','menu-unidad-bloqueo','🔒'));
            }
            unidades.append(boton);
          });
        }
        curso.append(unidades);
        lista.append(curso);
      });
      grupo.append(lista);
      nav.append(grupo);
    });
    if (!visibles) nav.append(crear('p','menu-sin-resultados','No encontramos materias con ese nombre.'));
  }
  entrada.addEventListener('input',renderizar);
  renderizar();
}
