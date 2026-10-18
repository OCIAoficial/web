# OCIA · Olimpiada Chilena de Inteligencia Artificial

Sitio de la fase nacional chilena de la IOAI, ciclo **2026–2027**. HTML, CSS y JavaScript con módulos nativos, sin dependencias de ejecución ni framework. Requiere **Node.js 22 o posterior** para las herramientas locales.

## Desarrollo

```sh
npm run dev
```

Abre <http://127.0.0.1:4173>. No hace falta ejecutar `npm install`. Después de editar, recarga el navegador.

```sh
npm test
npm run build
npm run preview
```

La vista previa del build abre en <http://127.0.0.1:4174>. Ambos servidores aceptan `--host` y `--port`; por ejemplo, `npm run dev -- --port 3000`.

El build genera `dist/`, listo para cualquier alojamiento de archivos estáticos. Se incluyen únicamente los archivos del sitio, los recursos y los PDF de referencia. No se incluyen archivos locales de agentes, metadatos Git, herramientas ni pruebas. Las rutas relativas permiten servir el sitio bajo una subcarpeta.

## Contenido y mantenimiento

- `index.html`: contenido de la portada, convocatoria, bases, resultados, preguntas y contacto; incluye contenido alternativo para navegación sin JavaScript.
- `noticias.html`: listado de anuncios y resultados. `noticia-inscripciones.html` es la primera publicación de ejemplo y dirige a Convocatoria para las bases y la inscripción.
- `temarios.html`: propuesta preliminar de contenidos regionales y nacionales, y resumen de la referencia internacional publicada para 2026.
- `materiales.html`: 11 videos introductorios pendientes, organizados en tres módulos, y recursos complementarios.
- `styles.css`: identidad visual, tipografía local, estados de foco y adaptaciones móviles.
- `app.js`: navegación móvil, pestañas accesibles, filtros de recursos y renderizado de los datos.
- `src/content.js`: ciclo, correo, última actualización, hitos, noticias y recursos.
- `src/lab.js`: demostración educativa de clasificación por tres vecinos más cercanos. Funciona en el navegador y no envía datos.
- `docs/referencias/`: documentos oficiales IOAI proporcionados para el proyecto.
- `assets/ocia-logo.svg`: logo vectorial proporcionado por la organización, con fondo exterior transparente. Se utiliza en el encabezado, el pie de página y el favicon.
- `assets/instituciones/`: logos originales proporcionados por la organización: CENIA y ProgComp como organizadores; IMC UC como patrocinador. Se conservan sus colores y proporciones.
- `assets/fonts/`: Manrope y su licencia SIL Open Font License.

Información confirmada por la organización:

| Dato | Estado |
| --- | --- |
| Ciclo | 2026–2027 |
| Correo | ocia@progcomp.cl |
| Organizadores | CENIA y ProgComp |
| Patrocinador | IMC UC |
| Formulario de inscripción | Aún sin enlace |
| Cierre de inscripción | 3 de enero de 2027 |
| Fase pre-regional | 9 de enero de 2027 · Online |
| Fase regional | 16 de enero de 2027 · Temuco, Concepción, Santiago, Valparaíso y Coquimbo |
| Fase nacional | 6 de marzo de 2027 · Santiago |
| Fase internacional | 4–10 de julio de 2027 · Singapur; calendario oficial |
| Bases nacionales | En preparación |
| Niveles escolares | 7° básico a 4° medio |
| Fases | Pre-regional, regional y nacional; preparación de la delegación para la competencia internacional |
| Evaluaciones y criterios de selección | Pendientes de las bases |
| Inscripción | Gratuita |
| Otros gastos y ayudas a participantes | Por confirmar |
| Resultados y ciclos anteriores | Sin información proporcionada para publicar |

Convocatoria concentra los accesos a las bases y al formulario de inscripción. Por ahora, «Inscribirme» y «Bases de la OCIA» son botones deshabilitados. Al tener los destinos, reemplázalos por enlaces reales en `.call-actions` de `index.html`. Las preguntas frecuentes y la noticia de apertura dirigen a esa sección. El contacto abre el correo real.

### Noticias, temarios y videos

La primera noticia **es un placeholder interno**, con fecha de publicación del 12 de noviembre de 2026 indicada por la organización. Los listados muestran el logo OCIA a la izquierda y la fecha bajo el título, sin etiquetas de categoría ni de ejemplo. Para publicar la apertura real, habilita los enlaces a bases y formulario en Convocatoria, actualiza el anuncio y su aviso de vista previa, y marca `placeholder: false` en `news`.

Para otra noticia, crea un HTML con URL permanente usando la primera publicación como referencia, agrega el archivo a `PUBLIC_FILES` en `scripts/public-files.mjs` y una entrada a `news` en `src/content.js` (`title`, `summary`, `category`, `date`, `url`, `image`, `imageAlt`, `imageFit`, `placeholder`). Usa `date` en formato `AAAA-MM-DD`; si no está definida, se omite la fecha visible. Las fechas ordenan las noticias de más reciente a más antigua; la portada muestra hasta tres. `image` indica la foto local e `imageAlt` su texto alternativo; `imageFit: 'contain'` permite mostrar logos completos, mientras que las fotos se recortan al cuadro. Actualiza también el respaldo HTML de los listados en `index.html` y `noticias.html`, y la fecha de la página individual, para visitas sin JavaScript. Conserva las publicaciones de ciclos anteriores.

El temario regional y el orden de los 11 videos siguen `../materiales/clases/clases.md`: nueve clases conceptuales y dos de práctica guiada. La descripción regional incluye los contenidos de las diez clases de materia; la última integra lo aprendido. El temario nacional es una propuesta intermedia de práctica con modelos, orientada también por `../organizacion/05_formacion/programa.md`. La evaluación definitiva sigue pendiente de las bases. El resumen internacional corresponde al temario publicado para 2026; comprueba la edición correspondiente antes de aprobar el contenido de 2026–2027.

Los archivos de la carpeta hermana se consultaron como antecedentes. No se copiaron al sitio el examen reservado, su pauta, las soluciones docentes ni documentos de organización.

Los 11 videos de `materiales.html` tienen títulos propuestos, sin enlaces ni duraciones ficticias. Al publicar cada uno, reemplaza su portada por un enlace real al video o un reproductor con título accesible y subtítulos, y cambia «Próximamente» por su estado publicado. Los recursos externos siguen disponibles al final de la página. Las nuevas páginas conservan contenido y navegación sin JavaScript y usan el mismo menú móvil.

El calendario usa `site.milestones`: `date` admite fechas ISO (`AAAA-MM-DD`) o meses (`AAAA-MM`), `endDate` indica el último día de un rango y `location` muestra el lugar. Al editar, actualiza también el respaldo HTML de `#milestones` para visitantes sin JavaScript y cualquier anuncio que cite esas fechas. Actualiza `site.updated` cuando cambie información pública. Si cambia el ciclo o el correo, actualiza también el título, las etiquetas sociales y el contenido alternativo del HTML.

Antes de abrir la convocatoria deben publicarse las bases nacionales aprobadas, la elegibilidad, el método de inscripción, las fechas, evaluaciones y criterios de avance, la selección de delegación/reservas y los costos o gratuidad por etapa con las ayudas disponibles. Las reglas internacionales se presentan como referencia y no sustituyen las bases OCIA.

Para archivar una edición, crea su página permanente y enlázala desde una noticia de cierre del ciclo. La página debe conservar el proceso realmente usado y sus desviaciones, los resultados de todas las etapas, la delegación (o cantidades si la privacidad lo requiere), sus resultados IOAI y el reconocimiento de financiamiento. No reemplaces ni elimines ediciones anteriores. Las páginas adicionales deben incorporarse a la lista pública de `scripts/public-files.mjs` para servirlas y empaquetarlas.

## Fuentes de contenido y diseño

Consultadas el 18 de octubre de 2026:

- [IOAI Regulations](https://ioai-official.org/wp-content/uploads/2025/11/85469c16-14e8-4677-81a7-1b927f4edd05.pdf), con copia en `docs/referencias/IOAI-Regulations.pdf`.
- [IOAI Accredited Organization – Website Guidelines](https://ioai-official.org/wp-content/uploads/2026/09/IOAI-Accredited-Organization-Website-Guidelines.pdf), con copia en `docs/referencias/IOAI-Accredited-Organization-Website-Guidelines.pdf`.
- [Directorio oficial IOAI](https://ioai-official.org/about/countries-and-territories/), punto de partida para las referencias nacionales.
- [Panamá · OlimPIA](https://olimpanama-ia.org/): organización de la información y recorrido por secciones.
- [Colombia · UAN](https://oc.uan.edu.co/olimpiada-colombiana-de-inteligencia-artificial): explicación dirigida al estudiante y visibilidad del proceso.
- [Brasil · ONIA](https://www.oniabrasil.com.br/): archivo por edición y acceso a documentación.
- [México · OMIA](https://comi.mx/omia/muro): acciones claras de preparación y participación.
- [Olimpiada Chilena de Informática](https://www.olimpiada-informatica.cl/): referencia solicitada para noticias con título, resumen, fecha y página permanente.
- [Temario internacional 2026](https://ioai-official.org/syllabus/): referencia para el resumen de la fase internacional; no sustituye el temario de la próxima edición.
- [Calendario internacional 2027](https://ioai-official.org/singapore-2027/ioai-2027-timeline/): competencia del 4 al 10 de julio de 2027 en Singapur. Fechas y sedes nacionales proporcionadas por la organización.

Se tomaron patrones de organización y navegación. No se trasladaron fechas, bases, resultados, marcas ni requisitos nacionales de otros países. Los enlaces de preparación apuntan a IOAI y Google y no se presentan como un entrenamiento OCIA aprobado. La organización por CENIA y ProgComp y el patrocinio de IMC UC fueron confirmados por el usuario, quien proporcionó los tres logos. El patrocinio institucional no implica que estén confirmadas ayudas económicas a participantes o financiamiento de viajes.
