import {
  EmotionalFocusCategory,
  StreakBadge,
  StreakTaskItem,
  StreakDayProgress,
} from '../types/psychologyTest';

export const OFFICIAL_STREAK_BADGES: StreakBadge[] = [
  {
    id: 'badge_semilla_valentia',
    level: 1,
    levelLabel: 'NIVEL 1',
    name: 'Semilla de Valentía',
    subtitle: 'El valor de transformar tu día',
    description:
      'Desbloqueada al completar tu primera ruta interactiva de 7 días.',
    emoji: '🌱',
    icon: 'leaf',
    color: '#FF7A00',
    softBg: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  {
    id: 'badge_llama_resiliencia',
    level: 2,
    levelLabel: 'NIVEL 2',
    name: 'Llama de Resiliencia',
    subtitle: 'Constancia y determinación diaria',
    description:
      'Reconoce tu disciplina para mantenerte en movimiento y superar cada desafío.',
    emoji: '🔥',
    icon: 'flame',
    color: '#FF7A00',
    softBg: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  {
    id: 'badge_faro_calma',
    level: 3,
    levelLabel: 'NIVEL 3',
    name: 'Faro de Calma',
    subtitle: 'Equilibrio y claridad interior',
    description:
      'Otorgada a quienes construyen hábitos sólidos de enfoque y bienestar.',
    emoji: '🌤️',
    icon: 'sunny',
    color: '#FF7A00',
    softBg: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  {
    id: 'badge_corazon_inquebrantable',
    level: 4,
    levelLabel: 'NIVEL 4',
    name: 'Corazón Inquebrantable',
    subtitle: 'Inspiración para la comunidad',
    description:
      'El máximo reconocimiento de Entre Nosotros por tu evolución y constancia.',
    emoji: '👑',
    icon: 'trophy',
    color: '#FF7A00',
    softBg: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
];

export const FOCUS_CATEGORY_META: Record<
  EmotionalFocusCategory,
  {
    title: string;
    shortProblemLabel: string;
    subtitle: string;
    emoji: string;
    color: string;
    softBg: string;
    animaPrompt: string;
    postTagText: string;
  }
> = {
  tristeza: {
    title: 'Renovando mi Energía y Ánimo',
    shortProblemLabel: 'renovando mi ánimo y vitalidad',
    subtitle: 'Ruta interactiva de 7 días con experiencias reales para reconectar con lo que disfrutas.',
    emoji: '🌤️',
    color: '#FF7A00',
    softBg: '#F8FAFC',
    animaPrompt:
      'He preparado una Ruta de 7 Días diseñada para ti. Cada día tendrás una actividad especial para reconectar con tus gustos, despejar tu mente y compartir tu avance en tu perfil.',
    postTagText: 'Renovando mi ánimo y energía',
  },
  ansiedad: {
    title: 'Recuperando mi Calma Interior',
    shortProblemLabel: 'construyendo calma y enfoque personal',
    subtitle: 'Programa de 7 días con actividades dinámicas para despejar la mente y disfrutar el presente.',
    emoji: '🌿',
    color: '#FF7A00',
    softBg: '#F8FAFC',
    animaPrompt:
      'Diseñé para ti una Ruta de 7 Días enfocada en despejar tu mente con experiencias prácticas, creativas y al aire libre. ¿Comenzamos hoy en tu perfil?',
    postTagText: 'Recuperando mi calma interior',
  },
  enojo: {
    title: 'Canalizando mi Energía en Acción',
    shortProblemLabel: 'transformando mi energía en proyectos positivos',
    subtitle: '7 desafíos dinámicos de movimiento, creatividad y renovación de tu entorno.',
    emoji: '⚡',
    color: '#FF7A00',
    softBg: '#F8FAFC',
    animaPrompt:
      'Tu energía tiene un gran potencial cuando la diriges a metas que te apasionan. Preparé una Ruta de 7 Días con desafíos activos para liberar tensión y avanzar.',
    postTagText: 'Transformando mi energía en acción',
  },
  inseguridad: {
    title: 'Fortaleciendo mi Confianza Personal',
    shortProblemLabel: 'impulsando mi seguridad y crecimiento personal',
    subtitle: '7 días de retos de expresión, talento personal y metas cumplidas.',
    emoji: '✨',
    color: '#FF7A00',
    softBg: '#F8FAFC',
    animaPrompt:
      'Es momento de reconocer todo tu potencial. Armé una Ruta de 7 Días con desafíos pensados para celebrar tus talentos, tus gustos y tus proyectos.',
    postTagText: 'Impulsando mi confianza y crecimiento',
  },
  estres: {
    title: 'Desconexión y Recarga Total',
    shortProblemLabel: 'equilibrando mi rutina y bienestar',
    subtitle: '7 experiencias diarias para salir de la rutina y dedicarte tiempo de calidad.',
    emoji: '🔋',
    color: '#FF7A00',
    softBg: '#F8FAFC',
    animaPrompt:
      'Mereces desconectarte de la presión diaria con actividades que realmente disfrutes. Aquí tienes tu Ruta de 7 Días para renovar tu rutina.',
    postTagText: 'Recargando mi energía y bienestar',
  },
  felicidad: {
    title: 'Impulsando mi Mejor Versión',
    shortProblemLabel: 'compartiendo inspiración y crecimiento diario',
    subtitle: '7 desafíos creativos y sociales para expandir tu bienestar e inspirar a otros.',
    emoji: '☀️',
    color: '#FF7A00',
    softBg: '#F8FAFC',
    animaPrompt:
      'Estás en un gran momento para proponerte nuevos retos. Inicia tu Ruta de 7 Días y comparte tus actividades favoritas con la comunidad.',
    postTagText: 'Impulsando mi mejor versión',
  },
};

/**
 * 108 DESAFÍOS INTERACTIVOS, INTERESANTES Y PROFESIONALES (18 por categoría)
 */
export const ALL_STREAK_TASKS: StreakTaskItem[] = [
  // ==================== 1. TRISTEZA / RENOVACIÓN (18 desafíos) ====================
  {
    id: 'tri_1',
    category: 'tristeza',
    emoji: '🍳',
    title: 'Cocina tu platillo o postre favorito',
    description: 'Prepara hoy esa comida, cena o postre que tanto te gusta. Dedícale tiempo a emplatarlo bonito y sube la foto de tu creación culinaria.',
  },
  {
    id: 'tri_2',
    category: 'tristeza',
    emoji: '🎧',
    title: 'Ruta de caminata con tu playlist favorita',
    description: 'Arma una lista con tus canciones preferidas, sal a recorrer un parque o avenida durante 20 minutos y captura la mejor vista de tu recorrido.',
  },
  {
    id: 'tri_3',
    category: 'tristeza',
    emoji: '🎬',
    title: 'Noche de cine personal en casa',
    description: 'Elige una película o serie que te inspire, prepara tus palomitas o snack favorito y arma tu propio cine en casa. Comparte foto del momento.',
  },
  {
    id: 'tri_4',
    category: 'tristeza',
    emoji: '☕',
    title: 'Visita o crea tu rincón de cafetería',
    description: 'Ve a tu cafetería favorita o prepara en casa una bebida especial digna de barista (frappé, café, matcha o smoothie) y tómale una gran foto.',
  },
  {
    id: 'tri_5',
    category: 'tristeza',
    emoji: '🛋️',
    title: 'Rediseña un espacio de tu habitación',
    description: 'Cambia de lugar algún elemento, acomoda tu escritorio o dale un toque nuevo de decoración e iluminación a tu cuarto. Muestra el resultado.',
  },
  {
    id: 'tri_6',
    category: 'tristeza',
    emoji: '🌅',
    title: 'Caza fotográfica del atardecer',
    description: 'Sal a un punto con buena vista al caer la tarde y captura la mejor fotografía de los colores del cielo en tu ciudad.',
  },
  {
    id: 'tri_7',
    category: 'tristeza',
    emoji: '📚',
    title: 'Tarde de lectura y aprendizaje',
    description: 'Elige un libro, novela, manga o artículo sobre un tema que te apasione y dedícale 25 minutos acompañado de tu bebida preferida.',
  },
  {
    id: 'tri_8',
    category: 'tristeza',
    emoji: '🎨',
    title: 'Proyecto creativo con tus manos',
    description: 'Dedica un rato a ilustrar, pintar, editar una fotografía artística, tocar un instrumento o armar algo creativo y compártelo.',
  },
  {
    id: 'tri_9',
    category: 'tristeza',
    emoji: '🍕',
    title: 'Comparte una comida o charla especial',
    description: 'Invita a un amigo, familiar o compañero a comer algo rico o conversar un buen rato y sube una foto de lo que compartieron.',
  },
  {
    id: 'tri_10',
    category: 'tristeza',
    emoji: '🚲',
    title: 'Explora una calle o parque diferente',
    description: 'Sal a caminar o andar en bici por una zona tranquila que casi no visites y fotografía el rincón que más te llame la atención.',
  },
  {
    id: 'tri_11',
    category: 'tristeza',
    emoji: '🪴',
    title: 'Adopta o cuida un espacio verde',
    description: 'Dedica tiempo a trasplantar, podar o cuidar las plantas de tu casa o jardín, o visita un vivero cercano y captura tu planta favorita.',
  },
  {
    id: 'tri_12',
    category: 'tristeza',
    emoji: '🧁',
    title: 'Receta nueva que nunca habías probado',
    description: 'Busca una receta fácil en internet (un desayuno distinto, pasta, ensalada o postre) y anímate a prepararla por primera vez.',
  },
  {
    id: 'tri_13',
    category: 'tristeza',
    emoji: '🎮',
    title: 'Sesión de tu hobby o juego favorito',
    description: 'Dedica una hora libre de culpas a tu pasatiempo favorito: videojuegos, juegos de mesa, fotografía o música, y comparte tu setup.',
  },
  {
    id: 'tri_14',
    category: 'tristeza',
    emoji: '👟',
    title: 'Reto de movimiento de 20 minutos',
    description: 'Realiza una rutina activa en casa, sal a trotar o practica tu deporte favorito para activar las endorfinas de tu cuerpo.',
  },
  {
    id: 'tri_15',
    category: 'tristeza',
    emoji: '📸',
    title: 'Álbum de tu objeto con más historia',
    description: 'Fotografía un recuerdo, coleccionable, prenda o regalo que tenga una historia especial en tu vida y cuéntanos por qué te gusta.',
  },
  {
    id: 'tri_16',
    category: 'tristeza',
    emoji: '🍨',
    title: 'Sal por tu helado o antojo preferido',
    description: 'Date una escapada hoy para comprarte ese helado, pan dulce o snack que tanto disfrutas y presume tu elección.',
  },
  {
    id: 'tri_17',
    category: 'tristeza',
    emoji: '🗺️',
    title: 'Planea tu próxima salida o proyecto',
    description: 'Escribe en una libreta 3 lugares que quieres visitar o 3 planes que te ilusionen para los próximos meses y comparte tu planeación.',
  },
  {
    id: 'tri_18',
    category: 'tristeza',
    emoji: '🐾',
    title: 'Paseo o sesión de fotos con tu mascota o naturaleza',
    description: 'Dedica tiempo de calidad a jugar o pasear con tu mascota, o captura la fauna y naturaleza de un parque cercano.',
  },

  // ==================== 2. ANSIEDAD / ENFOQUE Y CALMA (18 desafíos) ====================
  {
    id: 'ans_1',
    category: 'ansiedad',
    emoji: '🍵',
    title: 'Ritual de bebida artesanal sin prisas',
    description: 'Prepara desde cero un té especial, infusión con frutas o café de especialidad concentrándote en los aromas y sabores.',
  },
  {
    id: 'ans_2',
    category: 'ansiedad',
    emoji: '🌲',
    title: 'Caminata desconectada en la naturaleza',
    description: 'Deja el teléfono en silencio durante 25 minutos mientras recorres un parque o área arbolada, y al final toma una foto del paisaje.',
  },
  {
    id: 'ans_3',
    category: 'ansiedad',
    emoji: '🧩',
    title: 'Reto de concentración manual',
    description: 'Dedica 30 minutos a armar un rompecabezas, construir algo, dibujar a detalle o cocinar una receta paso a paso.',
  },
  {
    id: 'ans_4',
    category: 'ansiedad',
    emoji: '🕯️',
    title: 'Diseña tu santuario nocturno de descanso',
    description: 'Transforma tu habitación esta tarde con iluminación cálida, orden impecable y tu música instrumental o ambiental favorita.',
  },
  {
    id: 'ans_5',
    category: 'ansiedad',
    emoji: '📓',
    title: 'Journaling de ideas y proyectos',
    description: 'En una libreta bonita, organiza tus ideas de la semana separando lo importante de lo que puedes soltar, junto a un café o té.',
  },
  {
    id: 'ans_6',
    category: 'ansiedad',
    emoji: '🧘',
    title: 'Sesión de movilidad, yoga o estiramiento',
    description: 'Prepara un espacio cómodo y realiza 20 minutos de estiramientos profundos o movilidad corporal con música relajante.',
  },
  {
    id: 'ans_7',
    category: 'ansiedad',
    emoji: '🥗',
    title: 'Prepara un bowl o platillo lleno de color',
    description: 'Cocina un platillo fresco combinando al menos 4 colores naturales distintos (frutas, verduras, proteínas) y fotografía tu plato.',
  },
  {
    id: 'ans_8',
    category: 'ansiedad',
    emoji: '📷',
    title: 'Fotografía macro de arquitectura o naturaleza',
    description: 'Sal a observar los detalles que nadie mira (flores, hojas, edificios, sombras) y captura una foto con encuadre artístico.',
  },
  {
    id: 'ans_9',
    category: 'ansiedad',
    emoji: '💻',
    title: 'Renovación minimalista de tu escritorio',
    description: 'Limpia y organiza por completo tu mesa de estudio o trabajo dejando solo lo esencial e inspirador. Sube foto del resultado.',
  },
  {
    id: 'ans_10',
    category: 'ansiedad',
    emoji: '🎵',
    title: 'Descubre un álbum o género musical nuevo',
    description: 'Escucha de principio a fin un disco acústico, jazz, lo-fi o soundtrack de cine mientras descansas o dibujas.',
  },
  {
    id: 'ans_11',
    category: 'ansiedad',
    emoji: '🌅',
    title: 'Mañana o tarde sin pantallas digitales',
    description: 'Regálate 40 minutos lejos de redes sociales para desayunar o merendar al aire libre o junto a la ventana.',
  },
  {
    id: 'ans_12',
    category: 'ansiedad',
    emoji: '🍰',
    title: 'Repostería o cocina terapéutica',
    description: 'Prepara hotcakes, galletas, un sándwich gourmet o postre casero disfrutando cada paso del proceso en la cocina.',
  },
  {
    id: 'ans_13',
    category: 'ansiedad',
    emoji: '📖',
    title: 'Club de lectura contigo mismo/a',
    description: 'Ve a una banca de parque, jardín o sillón cómodo y avanza un capítulo completo de un libro físico.',
  },
  {
    id: 'ans_14',
    category: 'ansiedad',
    emoji: '🌿',
    title: 'Tarde de jardín o cuidado botánico',
    description: 'Limpia las hojas de tus plantas, riégalas y acomódalas cerca de la luz natural. Comparte foto de tu rincón verde.',
  },
  {
    id: 'ans_15',
    category: 'ansiedad',
    emoji: '🎨',
    title: 'Expresión visual libre',
    description: 'Crea un collage, boceto, diseño digital o caligrafía en cuaderno que represente tranquilidad y equilibrio.',
  },
  {
    id: 'ans_16',
    category: 'ansiedad',
    emoji: '🚶',
    title: 'Recorrido al aire libre al caer el sol',
    description: 'Sal a caminar a paso tranquilo cuando baje el calor del día y captura la luz dorada de la tarde.',
  },
  {
    id: 'ans_17',
    category: 'ansiedad',
    emoji: '🧖',
    title: 'Sesión de spa y cuidado personal en casa',
    description: 'Dedica 30 minutos a una rutina completa de cuidado personal, baño relajante y descanso con tu bebida favorita.',
  },
  {
    id: 'ans_18',
    category: 'ansiedad',
    emoji: '🌌',
    title: 'Contemplación nocturna y cierre del día',
    description: 'Sal al patio, balcón o ventana por la noche, observa el cielo nocturno o las luces de la ciudad y captura una foto serena.',
  },

  // ==================== 3. ENOJO / CANALIZAR ENERGÍA (18 desafíos) ====================
  {
    id: 'eno_1',
    category: 'enojo',
    emoji: '🏋️',
    title: 'Entrenamiento intenso o cardio liberador',
    description: 'Canaliza toda tu energía en una sesión de entrenamiento, pesas, correr, saltar la cuerda o bici durante 25 minutos.',
  },
  {
    id: 'eno_2',
    category: 'enojo',
    emoji: '🌮',
    title: 'Prepara un platillo especiado o a la parrilla',
    description: 'Métete a la cocina y prepara unos buenos tacos, pasta, hamburguesa casera o tu platillo fuerte favorito con música animada.',
  },
  {
    id: 'eno_3',
    category: 'enojo',
    emoji: '🎸',
    title: 'Sesión musical a todo pulmón',
    description: 'Pon tus canciones con más ritmo y energía, toca un instrumento o canta mientras reorganizas tu espacio.',
  },
  {
    id: 'eno_4',
    category: 'enojo',
    emoji: '🧹',
    title: 'Transformación radical de tu clóset o cuarto',
    description: 'Usa tu impulso para depurar lo que ya no usas y dejar tu habitación o armario completamente renovado.',
  },
  {
    id: 'eno_5',
    category: 'enojo',
    emoji: '🚴',
    title: 'Ruta larga de caminata o ciclismo',
    description: 'Sal a recorrer una distancia retadora a buen ritmo hasta sentir que tu mente quedó despejada y ligera.',
  },
  {
    id: 'eno_6',
    category: 'enojo',
    emoji: '🍹',
    title: 'Prepara un mocktail o bebida refrescante',
    description: 'Combina hielo, frutas cítricas, menta o tu jugo favorito para crear una bebida ultra refrescante digna de restaurante.',
  },
  {
    id: 'eno_7',
    category: 'enojo',
    emoji: '🎯',
    title: 'Termina ese pendiente que habías pospuesto',
    description: 'Usa tu determinación de hoy para resolver de una vez por todas un proyecto, tarea o arreglo de casa y celebra el resultado.',
  },
  {
    id: 'eno_8',
    category: 'enojo',
    emoji: '📸',
    title: 'Fotografía urbana de contraste',
    description: 'Sal a caminar y toma una fotografía potente de calles, luces, edificios o movimiento urbano.',
  },
  {
    id: 'eno_9',
    category: 'enojo',
    emoji: '🥊',
    title: 'Reto deportivo de resistencia',
    description: 'Completa un circuito de ejercicio en casa o al aire libre y sube foto al terminar tu sesión.',
  },
  {
    id: 'eno_10',
    category: 'enojo',
    emoji: '🍜',
    title: 'Cena reconfortante hecha por ti',
    description: 'Prepara un ramen mejorado, pizza casera o cena especial para cerrar el día con buen sabor de boca.',
  },
  {
    id: 'eno_11',
    category: 'enojo',
    emoji: '🌳',
    title: 'Cambio total de ambiente por una hora',
    description: 'Sal de la rutina y visita un parque amplio, mirador o plaza comercial para despejar tu perspectiva.',
  },
  {
    id: 'eno_12',
    category: 'enojo',
    emoji: '✍️',
    title: 'Diseño de nuevas metas personales',
    description: 'Transforma cualquier inconformidad en un plan de acción: escribe 3 objetivos concretos para tu semana en tu libreta.',
  },
  {
    id: 'eno_13',
    category: 'enojo',
    emoji: '🎬',
    title: 'Película de acción, deporte o superación',
    description: 'Mira una gran película de superación o aventura con tu snack favorito para recargar motivación.',
  },
  {
    id: 'eno_14',
    category: 'enojo',
    emoji: '🛠️',
    title: 'Repara o mejora algo en tu hogar',
    description: 'Arregla, limpia a fondo o mejora algún mueble, equipo o rincón de tu casa y muestra el antes y después.',
  },
  {
    id: 'eno_15',
    category: 'enojo',
    emoji: '🎧',
    title: 'Podcast inspirador mientras caminas',
    description: 'Elige un episodio interesante de historia, psicología, comedia o crecimiento personal y escúchalo dando un paseo.',
  },
  {
    id: 'eno_16',
    category: 'enojo',
    emoji: '🍨',
    title: 'Consiéntete con tu postre frío favorito',
    description: 'Ve por un helado, nieve, frappé o paleta helada para refrescar la tarde y compartir tu momento.',
  },
  {
    id: 'eno_17',
    category: 'enojo',
    emoji: '🌅',
    title: 'Respira frente a un horizonte abierto',
    description: 'Busca un lugar desde donde puedas ver lejos (una terraza, parque o avenida amplia) y captura la amplitud del paisaje.',
  },
  {
    id: 'eno_18',
    category: 'enojo',
    emoji: '🏆',
    title: 'Cierre de jornada con victoria personal',
    description: 'Comparte en foto el logro o actividad del día que te hizo recuperar tu centro y tranquilidad.',
  },

  // ==================== 4. INSEGURIDAD / CONFIANZA Y TALENTO (18 desafíos) ====================
  {
    id: 'ins_1',
    category: 'inseguridad',
    emoji: '👨‍🍳',
    title: 'Presume tu plato estrella en la cocina',
    description: 'Cocina ese platillo que a ti te queda delicioso, preséntalo como en restaurante y compártelo con orgullo.',
  },
  {
    id: 'ins_2',
    category: 'inseguridad',
    emoji: '👔',
    title: 'Arma tu mejor outfit del día',
    description: 'Combina tus prendas, calzado o accesorios favoritos que reflejen tu estilo personal y comparte una foto de tu look o detalle.',
  },
  {
    id: 'ins_3',
    category: 'inseguridad',
    emoji: '🌟',
    title: 'Muestra un talento o habilidad tuya',
    description: 'Dedica tiempo a algo en lo que eres bueno/a (dibujar, cocinar, escribir, programar, música, deporte, plantas) y súbelo.',
  },
  {
    id: 'ins_4',
    category: 'inseguridad',
    emoji: '☕',
    title: 'Cita de lujo contigo mismo/a',
    description: 'Ve a comer, tomar un café o pasear a un lugar bonito disfrutando tu propia compañía como tu mejor invitado/a.',
  },
  {
    id: 'ins_5',
    category: 'inseguridad',
    emoji: '📚',
    title: 'Domina un tema o habilidad nueva hoy',
    description: 'Dedica 30 minutos a un curso, tutorial, idioma o libro que te haga crecer profesional o personalmente.',
  },
  {
    id: 'ins_6',
    category: 'inseguridad',
    emoji: '🏆',
    title: 'Bitácora de mis mayores logros',
    description: 'Escribe en una libreta 5 retos difíciles que ya has superado en tu vida y acompáñalo de una foto inspiradora.',
  },
  {
    id: 'ins_7',
    category: 'inseguridad',
    emoji: '🏋️',
    title: 'Supera tu marca de movimiento hoy',
    description: 'Sal a caminar, correr o entrenar proponiéndote 5 minutos más de lo habitual y celebra tu disciplina.',
  },
  {
    id: 'ins_8',
    category: 'inseguridad',
    emoji: '🎨',
    title: 'Crea algo original sin pedir permiso',
    description: 'Toma una fotografía artística, diseña algo o prepara una receta inventada por ti siguiendo tu propia intuición.',
  },
  {
    id: 'ins_9',
    category: 'inseguridad',
    emoji: '🛋️',
    title: 'Personaliza tu espacio a tu gusto',
    description: 'Pon en tu escritorio o habitación tus libros, pósters, plantas o recuerdos que hablen de quién eres tú.',
  },
  {
    id: 'ins_10',
    category: 'inseguridad',
    emoji: '🎶',
    title: 'Soundtrack de seguridad y poder',
    description: 'Comparte la canción o álbum que te llena de confianza cada vez que la escuchas antes de un gran reto.',
  },
  {
    id: 'ins_11',
    category: 'inseguridad',
    emoji: '🍽️',
    title: 'Prepara un desayuno o brunch de campeón/a',
    description: 'Consiéntete con un desayuno completo y bien servido (fruta, café, huevos o hotcakes) hecho para ti.',
  },
  {
    id: 'ins_12',
    category: 'inseguridad',
    emoji: '🗺️',
    title: 'Tablero de visión y próximas metas',
    description: 'Arma en papel o digital tus 3 grandes metas para este semestre y captura una foto de tu visión.',
  },
  {
    id: 'ins_13',
    category: 'inseguridad',
    emoji: '🌿',
    title: 'Explora un rincón cultural o natural',
    description: 'Visita una librería, museo, parque o plaza de tu ciudad y fotografía lo que más te haya inspirado.',
  },
  {
    id: 'ins_14',
    category: 'inseguridad',
    emoji: '💆',
    title: 'Tiempo de imagen y autocuidado',
    description: 'Dedica un rato especial a tu arreglo personal, barbería, skincare o descanso reparador.',
  },
  {
    id: 'ins_15',
    category: 'inseguridad',
    emoji: '🤝',
    title: 'Inicia una conversación o gesto positivo',
    description: 'Comparte un café, mensaje o detalle con alguien que valore tu amistad y captura un recuerdo del día.',
  },
  {
    id: 'ins_16',
    category: 'inseguridad',
    emoji: '📸',
    title: 'Mi rincón o actividad favorita de la semana',
    description: 'Muestra a la comunidad cuál es el lugar o actividad donde te sientes más auténtico/a y libre.',
  },
  {
    id: 'ins_17',
    category: 'inseguridad',
    emoji: '🧁',
    title: 'Premia tu esfuerzo de la semana',
    description: 'Cómprate o prepara ese postre, libro o detalle que querías como recompensa por seguir avanzando.',
  },
  {
    id: 'ins_18',
    category: 'inseguridad',
    emoji: '👑',
    title: 'Carta de reconocimiento a mi camino',
    description: 'Escribe una nota reconociendo tu evolución de estos días y súbela junto a tu bebida o rincón favorito.',
  },

  // ==================== 5. ESTRÉS / DESCONEXIÓN Y RECARGA (18 desafíos) ====================
  {
    id: 'est_1',
    category: 'estres',
    emoji: '🍝',
    title: 'Cocina sin prisas con música relajante',
    description: 'Olvídate del reloj y prepara tu comida o cena favorita disfrutando el proceso mientras suena tu playlist preferida.',
  },
  {
    id: 'est_2',
    category: 'estres',
    emoji: '🌳',
    title: 'Escapada de 30 minutos a un parque o jardín',
    description: 'Cierra pendientes por media hora y sal a caminar entre árboles o áreas abiertas para renovar el aire.',
  },
  {
    id: 'est_3',
    category: 'estres',
    emoji: '☕',
    title: 'Pausa gourmet a mitad del día',
    description: 'Haz un alto total en tus actividades para disfrutar un buen café, té helado o smoothie con un snack rico.',
  },
  {
    id: 'est_4',
    category: 'estres',
    emoji: '🎬',
    title: 'Tarde de película o serie con cero pendientes',
    description: 'Apaga las notificaciones del trabajo o escuela y disfruta un episodio o película completa en total comodidad.',
  },
  {
    id: 'est_5',
    category: 'estres',
    emoji: '🖥️',
    title: 'Setup limpio y organizado para empezar fresco',
    description: 'Ordena tu espacio de trabajo o estudio y agrégale una bebida o planta para que luzca impecable.',
  },
  {
    id: 'est_6',
    category: 'estres',
    emoji: '🌅',
    title: 'Caminata al atardecer para cerrar el día',
    description: 'Marca el final de tus obligaciones saliendo a caminar 20 minutos mientras cae el sol. Sube foto del cielo.',
  },
  {
    id: 'est_7',
    category: 'estres',
    emoji: '🍕',
    title: 'Noche de comida favorita sin culpas',
    description: 'Prepara o pide tu platillo favorito para cenar hoy y disfrútalo en un ambiente tranquilo.',
  },
  {
    id: 'est_8',
    category: 'estres',
    emoji: '📖',
    title: 'Lectura recreativa antes de dormir',
    description: 'Cambia la pantalla del celular por 20 minutos de lectura de un buen libro o revista con luz cálida.',
  },
  {
    id: 'est_9',
    category: 'estres',
    emoji: '🎧',
    title: 'Sesión de desconexión musical',
    description: 'Ponte tus audífonos, recuéstate en tu lugar más cómodo y escucha tus 4 canciones favoritas seguidas.',
  },
  {
    id: 'est_10',
    category: 'estres',
    emoji: '🏃',
    title: 'Deporte o movimiento para soltar tensión',
    description: 'Sal a correr, andar en bici o entrenar 20 minutos para liberar toda la carga acumulada en los hombros.',
  },
  {
    id: 'est_11',
    category: 'estres',
    emoji: '🍨',
    title: 'Paseo por un postre o bebida refrescante',
    description: 'Sal a dar una vuelta corta con el único propósito de disfrutar un helado, agua fresca o postre rico.',
  },
  {
    id: 'est_12',
    category: 'estres',
    emoji: '🪴',
    title: 'Conexión con tus plantas o mascotas',
    description: 'Dedica 20 minutos de atención plena a jugar con tu mascota o cuidar tus plantas lejos del teléfono.',
  },
  {
    id: 'est_13',
    category: 'estres',
    emoji: '🎨',
    title: 'Pasatiempo creativo o manual',
    description: 'Haz una actividad totalmente distinta a tus deberes: dibujar, tocar música, cocinar un postre o armar algo.',
  },
  {
    id: 'est_14',
    category: 'estres',
    emoji: '🥞',
    title: 'Desayuno o merienda preparada con calma',
    description: 'Dedica tiempo a preparar unos buenos hotcakes, fruta picada, café o baguette y siéntate a disfrutarlo.',
  },
  {
    id: 'est_15',
    category: 'estres',
    emoji: '🛋️',
    title: 'Rincón de descanso de fin de jornada',
    description: 'Prepara tu sillón o cama con cojines cómodos, luz tenue y tu bebida favorita para descansar de verdad.',
  },
  {
    id: 'est_16',
    category: 'estres',
    emoji: '📷',
    title: 'Captura el momento más tranquilo de tu día',
    description: 'Busca a lo largo del día ese instante donde sentiste calma y guárdalo en una fotografía.',
  },
  {
    id: 'est_17',
    category: 'estres',
    emoji: '🎲',
    title: 'Rato de risas, juegos o plática amena',
    description: 'Comparte un juego de mesa, partida online o charla divertida con amigos o familia.',
  },
  {
    id: 'est_18',
    category: 'estres',
    emoji: '🌙',
    title: 'Ritual de noche tranquila',
    description: 'Cierra tu día con una infusión tibia y tu habitación ordenada lista para un descanso profundo.',
  },

  // ==================== 6. FELICIDAD Y BIENESTAR (18 desafíos) ====================
  {
    id: 'fel_1',
    category: 'felicidad',
    emoji: '🍽️',
    title: 'Cocina y presenta tu receta favorita',
    description: 'Prepara tu platillo estrella y compártelo con la comunidad para inspirar el menú de hoy.',
  },
  {
    id: 'fel_2',
    category: 'felicidad',
    emoji: '🌅',
    title: 'Fotografía artística de tu día',
    description: 'Captura la imagen más estética y bonita que encuentres hoy en tu camino, parque o ciudad.',
  },
  {
    id: 'fel_3',
    category: 'felicidad',
    emoji: '☕',
    title: 'Brindis con tu bebida favorita',
    description: 'Prepara o compra tu bebida preferida del día y celebra un objetivo cumplido esta semana.',
  },
  {
    id: 'fel_4',
    category: 'felicidad',
    emoji: '🎶',
    title: 'Comparte el soundtrack de tu buen ánimo',
    description: 'Muestra qué canción, artista o playlist te está acompañando hoy mientras realizas tus actividades.',
  },
  {
    id: 'fel_5',
    category: 'felicidad',
    emoji: '🏃',
    title: 'Ruta activa al aire libre',
    description: 'Sal a caminar, correr o pasear por tu lugar favorito y comparte la energía de tu recorrido.',
  },
  {
    id: 'fel_6',
    category: 'felicidad',
    emoji: '📚',
    title: 'Recomendación de libro, película o serie',
    description: 'Toma foto al libro que estás leyendo o a la película que viste hoy y recomiéndala a la comunidad.',
  },
  {
    id: 'fel_7',
    category: 'felicidad',
    emoji: '🍰',
    title: 'Prepara o disfruta un postre especial',
    description: 'Endulza tu día preparando o degustando tu postre favorito y compártelo en foto.',
  },
  {
    id: 'fel_8',
    category: 'felicidad',
    emoji: '🪴',
    title: 'Rincón favorito de tu hogar',
    description: 'Muestra ese espacio de tu casa, estudio o jardín que te transmite mayor armonía y buen gusto.',
  },
  {
    id: 'fel_9',
    category: 'felicidad',
    emoji: '🎨',
    title: 'Proyecto personal en marcha',
    description: 'Comparte una foto de algún hobby, proyecto, estudio o creación en la que estés trabajando.',
  },
  {
    id: 'fel_10',
    category: 'felicidad',
    emoji: '🤝',
    title: 'Momento compartido con personas especiales',
    description: 'Disfruta una comida, café o paseo con amigos o familia y guarda una foto simbólica del momento.',
  },
  {
    id: 'fel_11',
    category: 'felicidad',
    emoji: '🐾',
    title: 'El mejor compañero de aventuras',
    description: 'Presume una foto de tu mascota, tus plantas o la naturaleza que alegra tus días.',
  },
  {
    id: 'fel_12',
    category: 'felicidad',
    emoji: '🍳',
    title: 'Desayuno lleno de energía',
    description: 'Prepara un desayuno delicioso para arrancar el día al 100% y comparte tu plato.',
  },
  {
    id: 'fel_13',
    category: 'felicidad',
    emoji: '🚲',
    title: 'Explorando un rincón nuevo',
    description: 'Visita un lugar diferente hoy —una cafetería, parque o calle— y captura tu experiencia.',
  },
  {
    id: 'fel_14',
    category: 'felicidad',
    emoji: '🎯',
    title: 'Meta de la semana en acción',
    description: 'Da un paso concreto hacia tu meta principal de este mes y comparte evidencia de tu progreso.',
  },
  {
    id: 'fel_15',
    category: 'felicidad',
    emoji: '🌇',
    title: 'Los colores del atardecer de hoy',
    description: 'Haz una pausa al caer el sol y regálale a la comunidad una postal del cielo de hoy.',
  },
  {
    id: 'fel_16',
    category: 'felicidad',
    emoji: '🧩',
    title: 'Tiempo para tu pasatiempo favorito',
    description: 'Dedica un buen rato a lo que más te divierte hacer en tu tiempo libre y compártelo.',
  },
  {
    id: 'fel_17',
    category: 'felicidad',
    emoji: '💌',
    title: 'Mensaje inspirador para la comunidad',
    description: 'Escribe una reflexión o frase que te haya servido en la vida y súbela junto a una buena foto.',
  },
  {
    id: 'fel_18',
    category: 'felicidad',
    emoji: '🏆',
    title: 'Celebrando el mejor momento de la semana',
    description: 'Elige la actividad que más disfrutaste hoy y compártela para cerrar con broche de oro.',
  },
];

/**
 * 50 FRASES BONITAS Y MOTIVADORAS PARA ACOMPAÑAR AL USUARIO
 */
export const STREAK_MOTIVATIONAL_QUOTES: string[] = [
  '1. No tienes que poder con todo hoy; dar un paso real ya es una gran victoria.',
  '2. Si hoy fue un día pesado, respira: mañana es una nueva oportunidad para ti.',
  '3. Avanzar no es una línea recta; cada intento tuyo cuenta y construye tu fortaleza.',
  '4. Está bien ir a tu propio ritmo, lo importante es seguir en movimiento.',
  '5. Tu valor no se mide por un día difícil, sino por la determinación con la que vuelves a empezar.',
  '6. Hoy hiciste lo mejor que pudiste con la energía que tenías, y eso es valioso.',
  '7. Los grandes cambios se construyen día a día; ten paciencia con tu propio proceso.',
  '8. Aunque hoy el día parezca gris, tu capacidad de salir adelante sigue intacta.',
  '9. Date permiso de recargar energía hoy para volver a intentarlo mañana con más claridad.',
  '10. No estás retrocediendo: estás tomando impulso para llegar más lejos.',
  '11. Cada acción que realizas por tu bienestar transforma tu entorno.',
  '12. Vamos un día a la vez, construyendo hábitos que te hagan sentir pleno.',
  '13. Incluso los árboles más fuertes se adaptan al viento para seguir creciendo.',
  '14. Mereces la misma paciencia y respeto que siempre le brindas a los demás.',
  '15. Un día difícil no borra todo el camino valiente que ya recorriste.',
  '16. Respira hondo: cada etapa compleja trae consigo un nuevo aprendizaje.',
  '17. Qué orgullo verte dedicar tiempo a ti y a las cosas que te hacen bien.',
  '18. Has superado el 100% de tus días más retadores hasta llegar aquí.',
  '19. Caminar con constancia siempre te lleva a lugares extraordinarios.',
  '20. Hoy sembraste una acción positiva que pronto dará grandes frutos.',
  '21. Reconoce cada avance que logras en tu semana, por pequeño que parezca.',
  '22. En Entre Nosotros compartimos el camino para que nadie avance en soledad.',
  '23. Reponer un día no es fallar, es elegir mantener firme tu compromiso contigo.',
  '24. La claridad llega cuando dejas de exigirte perfección y disfrutas el proceso.',
  '25. Poco a poco, tu constancia diaria se convierte en tu mayor fortaleza.',
  '26. Celebra tus momentos de calidad: cocinar algo rico, salir a caminar, escuchar buena música.',
  '27. Tu historia tiene grandes capítulos de crecimiento esperándote.',
  '28. Tu camino es único; enfócate en tu propio progreso de esta semana.',
  '29. A veces el paso más inteligente del día es hacer una pausa y retomar mañana con todo.',
  '30. Mira todo lo que has construido desde que decidiste iniciar tu ruta de 7 días.',
  '31. Tu bienestar emocional es la base de todos tus proyectos y sueños.',
  '32. Cada vez que cumples un reto personal, fortaleces la confianza en ti mismo.',
  '33. Suelta la presión innecesaria y quédate con lo que te aporta paz hoy.',
  '34. No importa cuántas veces ajustes el paso, importa la convicción con la que sigues adelante.',
  '35. Hay días para acelerar y días para recuperar aliento; ambos forman parte del éxito.',
  '36. Día tras día estás construyendo una versión más fuerte y serena de ti.',
  '37. Gracias por mantener tu compromiso con tu bienestar en esta ruta.',
  '38. La tranquilidad se construye con acciones reales como las que estás logrando esta semana.',
  '39. Confía en tu capacidad para transformar cualquier reto en crecimiento personal.',
  '40. Hoy dedicaste tiempo de calidad a tu vida, y eso merece celebrarse.',
  '41. Nunca subestimes el poder de cambiar de aire, crear algo nuevo o disfrutar tu comida favorita.',
  '42. Tu progreso inspira a otros miembros de la comunidad a seguir adelante.',
  '43. Si hoy necesitas recorrer tu actividad, mañana te espera una nueva oportunidad.',
  '44. La verdadera constancia consiste en retomar el camino con entusiasmo.',
  '45. Todo gran logro comienza con la decisión de intentarlo un día más.',
  '46. Qué gran satisfacción ver cómo conviertes tus días en experiencias llenas de vida.',
  '47. Recuerda siempre: tienes todo el talento y la fuerza para lograr lo que te propongas.',
  '48. Cada fotografía de tu ruta es la huella de tu dedicación personal.',
  '49. Hoy diste un paso firme hacia tu mejor versión.',
  '50. ¡Lo estás logrando! Sigue avanzando con esa determinación que te caracteriza.',
  '51. Cada día es una página en blanco para diseñar momentos que te llenen de energía.',
  '52. Tu constancia de hoy es la tranquilidad que disfrutarás mañana.',
  '53. Dedicarte tiempo de calidad es la mejor inversión que puedes hacer esta semana.',
  '54. Un cambio de ambiente, una buena canción o un platillo hecho por ti transforman tu día.',
  '55. Avanza con calma pero con paso firme; cada día suma en tu camino.',
  '56. Qué bien se siente cuando conviertes tu bienestar en tu prioridad diaria.',
  '57. Hoy es un gran día para descubrir algo nuevo y disfrutar el momento presente.',
  '58. Tu fortaleza crece cada vez que eliges cuidar tu mente y tu entorno.',
  '59. Los mejores hábitos nacen de actividades que realmente disfrutas hacer.',
  '60. Celebra tu disciplina: estar aquí hoy habla muy bien de tu compromiso contigo.',
  '61. Respira profundo, suelta la prisa y disfruta la experiencia de este día.',
  '62. Cada acción consciente que realizas ilumina tu semana entera.',
  '63. Date permiso de disfrutar las cosas buenas que construyes día con día.',
  '64. Tu energía se renueva cuando conectas con lo que te apasiona.',
  '65. Construir equilibrio es un arte que practicas un día a la vez.',
  '66. Hoy tienes frente a ti una nueva oportunidad para sorprenderte a ti mismo.',
  '67. La paz interior comienza cuando te tratas con paciencia y determinación.',
  '68. Haz de este día un recuerdo que valga la pena capturar y compartir.',
  '69. Tu bienestar no es una meta lejana, es lo que vives y eliges hoy.',
  '70. Cuando cuidas tu espacio y tu tiempo, tu mente encuentra claridad.',
  '71. Un paso constante vale más que mil planes sin empezar. ¡Sigue así!',
  '72. Hoy suma una experiencia auténtica a tu semana de crecimiento.',
  '73. Confía en tu ritmo: vas exactamente por el camino que necesitas recorrer.',
  '74. La inspiración aparece cuando te pones en movimiento.',
  '75. Rodéate de hábitos que te impulsen a sentirte pleno y en calma.',
  '76. Tu dedicación en esta ruta de 7 días refleja tu gran capacidad de superación.',
  '77. Siempre hay algo extraordinario esperando en las actividades de tu día.',
  '78. Regálate unos minutos de desconexión para reconectar con lo mejor de ti.',
  '79. Lo que hoy parece un paso sencillo, mañana será parte de tu gran transformación.',
  '80. Mantén viva tu curiosidad: probar cosas distintas renueva el ánimo.',
  '81. Qué admirable es verte construir tu propio bienestar día tras día.',
  '82. Hoy elige disfrutar el proceso tanto como el resultado final.',
  '83. Tu serenidad es tu mayor superpoder frente a cualquier reto cotidiano.',
  '84. Cada día completado en tu ruta demuestra todo lo que eres capaz de lograr.',
  '85. Haz una pausa, sonríe y reconoce todo el camino que ya has avanzado.',
  '86. Crear momentos especiales para ti cambia por completo la perspectiva de tu semana.',
  '87. La constancia convierte pequeños momentos en grandes logros personales.',
  '88. Hoy es el momento ideal para recargar tu energía con una actividad que te encante.',
  '89. Sigue cultivando hábitos que te hagan sentir orgulloso al terminar el día.',
  '90. Tu equilibrio emocional se fortalece con cada acción real que emprendes.',
  '91. Disfruta tu ruta a tu manera; este espacio es totalmente para ti.',
  '92. La mejor forma de predecir una gran semana es crearla día por día.',
  '93. Reconecta con tus gustos, tus proyectos y todo aquello que te inspira.',
  '94. Cada fotografía que sumas es testimonio de tu compromiso y evolución.',
  '95. Agradece tu esfuerzo de hoy: estás construyendo una rutina llena de propósito.',
  '96. Nunca subestimes el impacto positivo de dedicarte media hora solo para ti.',
  '97. Tu actitud y tu constancia hacen la diferencia en cada etapa del camino.',
  '98. Hoy transforma tu rutina en una experiencia creativa y renovadora.',
  '99. Estás más cerca de tu meta de 7 días; disfruta cada paso del recorrido.',
  '100. ANIMA está contigo en cada día de tu ruta: ¡sigue brillando con fuerza!',
];

const DAY_NAMES = [
  'Día 1 • Inicio de Ruta',
  'Día 2 • En Movimiento',
  'Día 3 • Creatividad y Calma',
  'Día 4 • Mitad del Camino',
  'Día 5 • Nueva Perspectiva',
  'Día 6 • Constancia Viva',
  'Día 7 • Meta Final',
];

export const getRandomStreakMotivationalQuote = (): string => {
  const raw =
    STREAK_MOTIVATIONAL_QUOTES[
      Math.floor(Math.random() * STREAK_MOTIVATIONAL_QUOTES.length)
    ] || STREAK_MOTIVATIONAL_QUOTES[0];
  return raw.replace(/^\d+\.\s*/, '');
};

export const resolveFreshTaskItem = (
  task: StreakTaskItem,
  dayNumber = 1
): StreakTaskItem => {
  if (!task) {
    return ALL_STREAK_TASKS[(dayNumber - 1) % ALL_STREAK_TASKS.length];
  }
  const foundById = ALL_STREAK_TASKS.find((t) => t.id === task.id);
  if (foundById) return foundById;
  const byCategory = ALL_STREAK_TASKS.filter((t) => t.category === task.category);
  if (byCategory.length > 0) {
    return byCategory[(dayNumber - 1) % byCategory.length];
  }
  return ALL_STREAK_TASKS[(dayNumber - 1) % ALL_STREAK_TASKS.length];
};

export const generateSevenDayTasksForUser = (
  _category?: EmotionalFocusCategory,
  userId?: string
): StreakDayProgress[] => {
  const userEntropy = (userId || '')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);

  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const rand = Math.sin(Date.now() + i * 97 + userEntropy) * 10000;
      const frac = Math.abs(rand - Math.floor(rand));
      const j = Math.floor(((Math.random() + frac) / 2) * (i + 1)) % (i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const finalSeven = shuffle(ALL_STREAK_TASKS).slice(0, 7);

  return finalSeven.map((task, idx) => ({
    dayNumber: idx + 1,
    dayName: DAY_NAMES[idx] || `Día ${idx + 1}`,
    task,
    status: idx === 0 ? 'unlocked' : 'locked',
    postponedCount: 0,
  }));
};
