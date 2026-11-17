# EntrenadorEstudio · Lenguajes y Autómatas II — Unidad 2

Aplicación web gratuita de práctica para estudiantes de **Lenguajes y Autómatas II**, centrada en la **generación de código intermedio**. Un mismo código fuente puede trabajarse mediante varias representaciones y comprobaciones.

## ¿Qué se puede practicar?

- **NPI (Notación Polaca Inversa):** construir múltiples árboles de expresiones o asignaciones, escribir el recorrido postorden separado por comas y obtener la NPI.
- **Código P:** traducir instrucciones y comprobar el estado de la pila tras su ejecución.
- **Triplos y cuádruplos:** completar tablas editables y revisar su resultado.
- **Estructuras de control:** ejercicios de expresiones aritméticas, `if/else`, `while`, `for` y `do/while`.
- **Estudio interactivo:** pistas, soluciones de referencia, animaciones, XP y seguimiento de intentos.

> **Alcance:** En condicionales y ciclos, la NPI se practica por árboles de condiciones y asignaciones. Los saltos del programa se revisan en Código P, triplos y cuádruplos. La validación admite equivalencias implementadas, pero no demuestra que cualquier programa arbitrario sea correcto.

## Cómo usarlo

**Opción 1 — En línea:** después de activar GitHub Pages, abre el enlace del sitio publicado desde la sección *Settings → Pages* de este repositorio. No necesitas instalar nada.

**Opción 2 — En Windows:** descarga el repositorio, extrae la carpeta y ejecuta `INICIAR.bat`. Requiere Python 3 instalado para iniciar un servidor HTTP local. Como alternativa, abre `index.html` con la extensión Live Server de VS Code.

**Opción 3 — Desde una terminal:** en la carpeta que contiene `index.html`, ejecuta `python -m http.server 8765` y visita `http://127.0.0.1:8765/`.

## Progreso y privacidad

Los intentos se guardan en el **almacenamiento local del navegador** (`localStorage`); no se envían a un servidor. Cada compañero tendrá su progreso propio. La opción **Exportar JSON** permite respaldar los resultados e **Importar JSON** permite restaurarlos. El progreso del sitio publicado no se comparte automáticamente con el progreso que tenías en localhost.

## Tecnologías

HTML5, CSS3, JavaScript (módulos ES) y almacenamiento local. **Sin React, sin base de datos y sin dependencias de instalación de npm.**

## Versión

**v0.8.0** — Taller de árboles con fichas arrastrables y reversibles, postorden con comas y cuatro representaciones de código intermedio.

## Aviso académico

Esta herramienta es un apoyo de práctica y puede contener limitaciones o errores; contrasta resultados con las convenciones de tu curso. No es una evaluación oficial.
