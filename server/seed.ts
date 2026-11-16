import type { IBlogPost, ICategory, IContactMessage, IProject } from './models.ts';

export const SEED_CATEGORIES: ICategory[] = [
  {
    id: 'cat-tech',
    name: 'Tecnología & IA',
    slug: 'tecnologia-ia',
    description: 'Arquitectura Full-Stack, Node.js, MongoDB, Google Cloud y modelos generativos.',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cat-art',
    name: 'Arte Digital & Marca',
    slug: 'arte-digital',
    description: 'Dirección creativa, branding, motion graphics y diseño editorial desde CEBRA.',
    createdAt: '2026-10-01T10:05:00.000Z',
  },
  {
    id: 'cat-music',
    name: 'Música & Producción',
    slug: 'musica',
    description: 'Composición Indie Rock, Indie Pop, audio experimental y el álbum Experiencias.',
    createdAt: '2026-10-01T10:10:00.000Z',
  },
  {
    id: 'cat-manifesto',
    name: 'Manifiesto & Propósito',
    slug: 'manifiesto',
    description: 'Reflexiones sobre conciencia creativa, impacto social y construcción de posibilidades.',
    createdAt: '2026-10-01T10:15:00.000Z',
  },
];

export const SEED_POSTS: IBlogPost[] = [
  {
    id: 'post-1',
    title: 'Donde el código se convierte en arte: Arquitectura Full-Stack con Node.js, MySQL e IA',
    slug: 'codigo-en-arte-arquitectura-nodejs-mysql-ia',
    excerpt:
      'Cómo unir la precisión de la ingeniería moderna con la sensibilidad visual y musical para construir plataformas web administrables en Hostinger.',
    content: `Desde aquella primera PC IBM con MS-DOS y Windows 95 en Valle de Santiago, Guanajuato, comprendí que una pantalla no era solo una herramienta de cálculo: era un lienzo interactivo.

En la industria tecnológica suele creerse que debemos elegir entre ser ingenieros rigurosos o artistas sensibles. Mi trayectoria demuestra exactamente lo contrario: la verdadera innovación ocurre cuando ambos hemisferios trabajan en sintonía.

Al diseñar ecosistemas como CEBRA.TECH, SIGEDI o plataformas sociales como Ángeles de Esperanza A.C., aplico una arquitectura limpia basada en Node.js, Express y bases de datos relacionales MySQL en Hostinger. Esto permite separar la capa editorial del motor de presentación, otorgando control total sobre categorías, entradas y seguimiento de proyectos en tiempo real.

Cuando además integramos flujos con Inteligencia Artificial y diseño UI/UX cuidado al detalle, el software deja de sentirse frío y se convierte en una experiencia capaz de amplificar nuestra humanidad.`,
    categorySlug: 'tecnologia-ia',
    categoryName: 'Tecnología & IA',
    coverImage: 'ai-architecture',
    readTimeMinutes: 6,
    published: true,
    featured: true,
    author: 'Cesar Augusto Bravo Hernández',
    createdAt: '2026-11-10T16:30:00.000Z',
    updatedAt: '2026-11-10T16:30:00.000Z',
  },
  {
    id: 'post-2',
    title: 'Experiencias en el estudio: Indie Rock, síntesis sonora y memoria convertida en música',
    slug: 'experiencias-en-el-estudio-indie-rock-produccion',
    excerpt:
      'De aquel pequeño sintetizador Casio familiar a la producción independiente de Indie Rock y Rock Alternativo: cada canción es un fragmento de historia.',
    content: `Antes de convertirme en diseñador o desarrollador, ya era músico. Descubrí este arte a los cuatro años y comencé a componer desde los once, rodeado de guitarras clásicas, sintetizadores y las voces de mi familia en Guanajuato.

Cada línea de código y cada compás musical comparten exactamente la misma arquitectura invisible: ritmo, estructura, tensión y resolución.

En la producción de mi álbum "Experiencias" —gestado entre temas inéditos y sesiones nocturnas de estudio con guitarra eléctrica, interfaces análogas y DAWs modernos— el mensaje central siempre ha sido claro: tú decides lo que quieres sentir.

Explorar géneros como el Indie Pop, Indie Rock y Rock Alternativo me permite traducir vivencias, aprendizajes y estados de conciencia en frecuencias que dialogan directamente con quien escucha.`,
    categorySlug: 'musica',
    categoryName: 'Música & Producción',
    coverImage: 'music-production',
    readTimeMinutes: 5,
    published: true,
    featured: false,
    author: 'Cesar Augusto Bravo Hernández',
    createdAt: '2026-11-06T12:00:00.000Z',
    updatedAt: '2026-11-06T12:00:00.000Z',
  },
  {
    id: 'post-3',
    title: 'CEBRA Arte Digital: 22 años transformando ideas invisibles en identidades visuales',
    slug: 'cebra-arte-digital-identidades-visuales-estrategia',
    excerpt:
      'Toda gran obra comienza siendo invisible. Claves de dirección creativa, branding y diseño editorial para marcas con propósito.',
    content: `Hace más de veintidós años elegí el camino del arte digital de manera autodidacta y profesional: diseño gráfico, fotografía comercial, motion graphics, identidad corporativa y comunicación estratégica.

Todo ese recorrido dio origen a CEBRA – Arte Digital & Marketing, una agencia creativa mexicana nacida para acompañar a emprendedores, empresas y proyectos culturales en la construcción de su presencia visual.

No diseñamos únicamente logotipos o piezas aisladas para redes sociales. Esculpimos sistemas visuales completos donde la tipografía, la fotografía y la narrativa digital responden a una sola intención estratégica.

Hoy mi visión es que CEBRA evolucione hacia un ecosistema colaborativo donde más artistas digitales puedan sumar talento, crecer profesionalmente y dar forma a proyectos trascendentes.`,
    categorySlug: 'arte-digital',
    categoryName: 'Arte Digital & Marca',
    coverImage: 'digital-art',
    readTimeMinutes: 4,
    published: true,
    featured: false,
    author: 'Cesar Augusto Bravo Hernández',
    createdAt: '2026-11-01T09:15:00.000Z',
    updatedAt: '2026-11-01T09:15:00.000Z',
  },
  {
    id: 'post-4',
    title: 'Tecnología con impacto social: Transformación digital de Ángeles de Esperanza A.C.',
    slug: 'tecnologia-impacto-social-angeles-de-esperanza',
    excerpt:
      'Arquitectura web, identidad filosófica y herramientas digitales abiertas al servicio de la comunidad y el bienestar humano.',
    content: `Creo firmemente que el software más avanzado es aquel que sirve a la humanidad. Cuando lideré la transformación digital de Ángeles de Esperanza A.C. (angelesdeesperanzaac.org), el reto iba mucho más allá de programar una página web.

Fue necesario construir la filosofía institucional completa, renovar todos los materiales gráficos e impresos con códigos QR actualizados, producir audiovisuales institucionales y desplegar una plataforma administrable ágil con blog, noticias y contacto directo.

Desde aquella invitación en la secundaria para asistir al congreso de la JPL-NASA en Tlaxcala, entendí que el conocimiento técnico cobra verdadero sentido cuando se convierte en acción y servicio.

Bajo esa misma convicción impulso proyectos de código abierto con licencia Apache 2.0 y educación creativa para construir comunidades más conscientes.`,
    categorySlug: 'manifiesto',
    categoryName: 'Manifiesto & Propósito',
    coverImage: 'social-impact',
    readTimeMinutes: 7,
    published: true,
    featured: false,
    author: 'Cesar Augusto Bravo Hernández',
    createdAt: '2026-10-25T18:45:00.000Z',
    updatedAt: '2026-10-25T18:45:00.000Z',
  },
];

export const SEED_PROJECTS: IProject[] = [
  {
    id: 'proj-angeles',
    title: 'Ángeles de Esperanza A.C.',
    slug: 'angeles-de-esperanza',
    subtitle: 'Plataforma institucional, identidad filosófica y gestión editorial',
    description:
      'Transformación digital integral para centro de rehabilitación: filosofía institucional, producción audiovisual, renovación gráfica QR y sitio web administrable con blog y noticias.',
    category: 'Impacto Social',
    status: 'En Progreso',
    progress: 85,
    stack: ['Node.js', 'MySQL Hostinger', 'PHP', 'Gemini AI', 'Identidad Visual'],
    url: 'https://angelesdeesperanzaac.org',
    repoUrl: 'https://github.com/cebraher',
    impactMetric: '100% digitalización institucional y canal de atención activo',
    nextMilestone: 'Integración de buscador inteligente y archivo audiovisual v2',
    milestones: [
      { id: 'm1', title: 'Actualización de códigos QR en formatos impresos', done: true },
      { id: 'm2', title: 'Redacción de filosofía institucional y manifiesto', done: true },
      { id: 'm3', title: 'Gráficos, fotografía y video institucional', done: true },
      { id: 'm4', title: 'Despliegue de buscador y módulo de noticias v2', done: false },
    ],
    updatedAt: '2026-11-12T10:00:00.000Z',
  },
  {
    id: 'proj-cebra',
    title: 'CEBRA — Arte Digital & Marketing',
    slug: 'cebra-arte-digital',
    subtitle: 'Agencia creativa, branding, motion graphics y arquitectura web',
    description:
      'Ecosistema de servicios creativos y desarrollo digital en Guanajuato y México: identidad corporativa, fotografía comercial, producción audiovisual y soluciones web a medida.',
    category: 'Arte & Marca',
    status: 'Completado',
    progress: 100,
    stack: ['React', 'Tailwind CSS', 'Figma', 'After Effects', 'Branding'],
    url: 'https://cebra.tech',
    repoUrl: 'https://www.behance.net/cebraher',
    impactMetric: '+22 años de trayectoria y red colaborativa de artistas',
    nextMilestone: 'Expansión de portal de colaboradores CEBRA.STORE',
    milestones: [
      { id: 'm5', title: 'Consolidación de portafolio en Behance @cebraher', done: true },
      { id: 'm6', title: 'Lanzamiento de identidad CEBRA.TECH y CEBRA.STORE', done: true },
      { id: 'm7', title: 'Catálogo de servicios audiovisuales y web', done: true },
    ],
    updatedAt: '2026-11-08T14:20:00.000Z',
  },
  {
    id: 'proj-sigedi',
    title: 'SIGEDI — Sistema de Gestión Digital',
    slug: 'sigedi-gestion-digital',
    subtitle: 'Panel operativo de planificación, calendario y automatización',
    description:
      'Sistema centralizado para coordinar entregables de diseño, desarrollo Full-Stack, seguimiento de metas académicas y flujos de trabajo automatizados.',
    category: 'Ingeniería & IA',
    status: 'En Progreso',
    progress: 60,
    stack: ['Node.js', 'Express', 'MySQL Hostinger', 'React', 'TypeScript'],
    url: 'https://cebraher.com',
    repoUrl: 'https://github.com/cebraher',
    impactMetric: 'Control unificado de 4 líneas operativas en tiempo real',
    nextMilestone: 'Sincronización de calendario operativo y alertas de hitos',
    milestones: [
      { id: 'm11', title: 'Esquema relacional MySQL para proyectos e hitos', done: true },
      { id: 'm12', title: 'Panel de seguimiento integrado en landing web', done: true },
      { id: 'm13', title: 'Automatización de reportes semanales', done: false },
    ],
    updatedAt: '2026-11-13T09:30:00.000Z',
  },
  {
    id: 'proj-musica',
    title: 'Álbum "Experiencias" & Sello Sonoro',
    slug: 'album-experiencias-cebra-music',
    subtitle: 'Composición y producción Indie Rock / Indie Pop / Rock Alternativo',
    description:
      'Producción musical independiente grabada y mezclada entre guitarras, sintetizadores y diseño sonoro experimental bajo la firma de Cesar Bravo.',
    category: 'Arte & Música',
    status: 'Completado',
    progress: 100,
    stack: ['Producción DAW', 'Guitarra Eléctrica', 'Síntesis', 'Spotify / YouTube'],
    url: 'https://www.youtube.com/@cebraher',
    repoUrl: 'https://open.spotify.com/intl-es/artist/66p3p4W65G4huFUZITROUW',
    impactMetric: 'Catálogo publicado en Spotify, YouTube @cebraher y SoundCloud',
    nextMilestone: 'Sesiones acústicas en vivo y nuevos sencillos 2027',
    milestones: [
      { id: 'm14', title: 'Composición y grabación de temas inéditos', done: true },
      { id: 'm15', title: 'Masterización y distribución digital multiplataforma', done: true },
      { id: 'm16', title: 'Video oficial de presentación en YouTube @cebraher', done: true },
    ],
    updatedAt: '2026-10-20T11:00:00.000Z',
  },
  {
    id: 'proj-advocacy',
    title: 'Ecosistema Open Source & Ceneval 286',
    slug: 'open-source-developer-advocacy',
    subtitle: 'Portafolio GitHub Apache 2.0 y acreditación en Ciencias Computacionales',
    description:
      'Consolidación de repositorios abiertos, documentación técnica y preparación académica en Ciencias Computacionales hacia Developer Advocacy.',
    category: 'Ingeniería & IA',
    status: 'Planificado',
    progress: 40,
    stack: ['GitHub', 'Apache 2.0', 'Google Cloud', 'Ciencias Computacionales'],
    url: 'https://cebraher.com',
    repoUrl: 'https://github.com/cebraher',
    impactMetric: 'Hoja de ruta 2026–2027 en ejecución continua',
    nextMilestone: 'Publicación de repositorio base web + CMS Hostinger MySQL en GitHub',
    milestones: [
      { id: 'm17', title: 'Lanzamiento de plantilla web + blog Hostinger en GitHub', done: true },
      { id: 'm18', title: 'Documentación técnica bilingüe de proyectos clave', done: false },
      { id: 'm19', title: 'Acreditación académica Computación (Enero 2027)', done: false },
    ],
    updatedAt: '2026-11-14T08:00:00.000Z',
  },
];

export const SEED_MESSAGES: IContactMessage[] = [
  {
    id: 'msg-1',
    name: 'Equipo Cultural Guanajuato',
    email: 'contacto@cultura-bajio.org',
    subject: 'Colaboración en identidad visual y plataforma web',
    message:
      'Hola Cesar, vimos tu trayectoria con CEBRA y Ángeles de Esperanza A.C. Nos encantaría cotizar un ecosistema web con blog administrable.',
    read: false,
    createdAt: '2026-11-13T15:10:00.000Z',
  },
];
