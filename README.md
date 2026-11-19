# Etriva · Plataforma de práctica académica (nombre propuesto)

Aplicación web gratuita de práctica para estudiantes de **Lenguajes y Autómatas II**, centrada en la **generación de código intermedio**. Un mismo código fuente puede trabajarse mediante varias representaciones y comprobaciones.

## ¿Qué se puede practicar?

- **NPI (Notación Polaca Inversa):** construir múltiples árboles de expresiones o asignaciones, escribir el recorrido postorden separado por comas y obtener la NPI.
- **Código P:** traducir instrucciones y comprobar el estado de la pila tras su ejecución.
- **Triplos y cuádruplos:** completar tablas editables y revisar su resultado.
- **Estructuras de control:** ejercicios de expresiones aritméticas, `if/else`, `while`, `for` y `do/while`.
- **Estudio interactivo:** pistas, soluciones de referencia, animaciones, XP y seguimiento de intentos.

> **Alcance:** En condicionales y ciclos, la NPI se practica por árboles de condiciones y asignaciones. Los saltos del programa se revisan en Código P, triplos y cuádruplos. La validación admite equivalencias implementadas, pero no demuestra que cualquier programa arbitrario sea correcto.

## Cómo usarlo

**Opción 1 — En línea:** abre [Etriva (antes EntrenadorEstudio) en GitHub Pages](https://robdev512.github.io/EntrenadorEstudio/). No necesitas instalar nada.

**Opción 2 — En Windows:** descarga el repositorio, extrae la carpeta y ejecuta `INICIAR.bat`. Requiere Python 3 instalado para iniciar un servidor HTTP local. Como alternativa, abre `index.html` con la extensión Live Server de VS Code.

**Opción 3 — Desde una terminal:** en la carpeta que contiene `index.html`, ejecuta `python -m http.server 8765` y visita `http://127.0.0.1:8765/`.

## Progreso y privacidad

Los intentos se guardan en el **almacenamiento local del navegador** (`localStorage`); no se envían a un servidor. Cada compañero tendrá su progreso propio. La opción **Exportar JSON** permite respaldar los resultados e **Importar JSON** permite restaurarlos. El progreso del sitio publicado no se comparte automáticamente con el progreso que tenías en localhost.

## Tecnologías

HTML5, CSS3, JavaScript (módulos ES) y almacenamiento local. **Sin React, sin base de datos y sin dependencias de instalación de npm.**

## Versión

**v1.0.0-rc.6 (preparación)** — Flujo secuencial de las cuatro representaciones, referencia del Código P aprobado al resolver triplos y de los triplos aprobados al resolver cuádruplos; logotipo e iconos propios. Conserva el taller de árboles, postorden con comas y la comprobación de pila.

## Ruta de práctica

Para cada código fuente, las representaciones se desbloquean en orden: **NPI → Código P → Triplos → Cuádruplos**. La siguiente etapa solo se abre después de validar la anterior. El botón **Continuar**, al final de cada ejercicio, avanza sin subir de nuevo.

En **Triplos**, la referencia fija muestra el código fuente junto con **tu Código P aprobado**. En **Cuádruplos**, muestra el código fuente junto con **tus triplos aprobados**. Siempre se utiliza tu respuesta validada, no una solución alternativa.

## Aviso académico

Esta herramienta es un apoyo de práctica y puede contener limitaciones o errores; contrasta resultados con las convenciones de tu curso. No es una evaluación oficial.

## Catálogo académico (vista previa v1.0)

La navegación se organiza como **semestre → materia → unidad** a partir del PDF «Competencias previas ISC + Desarrollo Full Stack» proporcionado para el Tec de Tepic: **9 semestres y 51 asignaturas**. La lista corresponde al documento aportado, no necesariamente a otros planes o generaciones.

Por ahora **solo Lenguajes y Autómatas II (semestre 7), Unidad 2** tiene actividades activas. Sus unidades 1, 3 y 4 están deshabilitadas. En las otras materias se muestra «Unidades por incorporar» porque el documento no contiene sus temarios ni el número exacto de unidades. Se pueden expandir y buscar materias, pero no entrar a ejercicios inexistentes.

**Compatibilidad:** mantenemos la clave `entrenador-estudio-progreso-v1` y la ruta del repositorio anterior para preservar los progresos en ese mismo navegador y dominio. Cambiar el nombre visible no altera el historial. Si en el futuro se renombra el repositorio o se cambia el dominio, habrá que exportar/importar el progreso, pues `localStorage` depende del origen.

**Identidad:** «Etriva» es un nombre provisional para esta vista previa; conserva el logotipo con letra E que ya tenía el proyecto. No se ha comprobado disponibilidad de marca o nombre comercial.

## Catálogo curricular y reloj (RC3)

La navegación despliega los nueve semestres y las **51 asignaturas** con sus créditos y el número de unidades de su programa oficial. Las unidades son informativas y permanecen desactivadas salvo **Lenguajes y Autómatas II, Unidad 2**.

La suma distingue **235 créditos de las asignaturas**, más **10 de residencia profesional, 10 de servicio social y 5 de actividades complementarias**, para un total de **260 créditos del plan**. No representa los créditos obtenidos por ningún estudiante.

El reloj digital/analógico refleja la hora local del dispositivo y guarda su presentación preferida en `localStorage`; no necesita internet ni acceso a la ubicación.

**Fuentes:** [plan de estudios del Instituto Tecnológico de Tepic](https://www.tepic.tecnm.mx/ofertaeducativa/licenciatura/ingenieria-en-sistemas-computacionales), programas oficiales de cada materia accesibles desde el portal; para el temario de Administración de Redes se contrastó el [documento SCA-1002 del TecNM](https://tlahuac.tecnm.mx/PDFs/sistemascompetencias/8_SCA-1002.pdf). Las claves se conservaron según el archivo de competencias previas compartido por el usuario y pueden variar respecto de las publicadas en el portal actual.
