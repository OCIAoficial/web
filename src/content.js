// Información nacional confirmada por la organización. No inferir fechas ni enlaces.
export const site = {
  name: 'OCIA',
  cycle: '2026–2027',
  email: 'ocia@progcomp.cl',
  updated: '2026-10-18',
  // Fechas nacionales indicadas por la organización.
  // Fechas internacionales: https://ioai-official.org/singapore-2027/ioai-2027-timeline/
  milestones: [
    { title: 'Cierre de inscripción', date: '2027-01-03' },
    { title: 'Fase pre-regional', date: '2027-01-09', location: 'Online' },
    { title: 'Fase regional', date: '2027-01-16', location: 'Temuco, Concepción, Santiago, Valparaíso y Coquimbo' },
    { title: 'Fase nacional', date: '2027-03-06', location: 'Santiago' },
    { title: 'Fase internacional', date: '2027-07-04', endDate: '2027-07-10', location: 'Singapur' },
  ],
};

// Agregar nuevas noticias con su fecha ISO y una URL permanente.
// La apertura es un ejemplo: no habilitar la inscripción hasta tener formulario y bases.
export const news = [
  {
    title: 'Abrimos las inscripciones para la fase pre-regional de la OCIA',
    summary: 'Inscripción gratuita para estudiantes de 7° básico a 4° medio, hasta el 3 de enero de 2027. La fase pre-regional se realizará online el 9 de enero de 2027.',
    category: 'Convocatoria',
    date: '2026-11-12',
    url: './noticia-inscripciones.html',
    image: './assets/ocia-logo.svg',
    imageAlt: 'Logo de la OCIA',
    imageFit: 'contain',
    placeholder: true,
  },
];

export const resources = [
  {
    category: 'beginner',
    eyebrow: '01 / RECURSOS',
    title: 'Centro de recursos IOAI',
    description: 'Encuentra cursos, materiales y herramientas en el centro de recursos de la IOAI.',
    source: 'Education Hub · IOAI',
    url: 'https://ioai-official.org/resources/',
    label: 'Explorar recursos',
    icon: 'compass',
  },
  {
    category: 'beginner',
    eyebrow: '02 / CURSO',
    title: 'Curso de aprendizaje automático',
    description: 'Un curso práctico de aprendizaje automático para avanzar a tu ritmo. Disponible en español.',
    source: 'Machine Learning Crash Course · Google',
    url: 'https://developers.google.com/machine-learning/crash-course?hl=es-419',
    label: 'Conocer el curso',
    icon: 'nodes',
  },
  {
    category: 'challenge',
    eyebrow: '03 / PROBLEMAS',
    title: 'Problemas IOAI',
    description: 'Explora los problemas y datos de las distintas ediciones de la olimpiada.',
    source: 'GitHub · IOAI',
    url: 'https://github.com/IOAI-official',
    label: 'Explorar los problemas',
    icon: 'code',
  },
];
