import {
  EmotionalFocusCategory,
  MainSupportTopicKey,
  StreakBadge,
  StreakTaskItem,
  StreakDayProgress,
} from '../types/psychologyTest';

export interface MainSupportTopicConfig {
  key: MainSupportTopicKey;
  name: string;
  shortSubtitle: string;
  squareImageUrl: string;
  emoji: string;
  accentColor: string;
  softBg: string;
  borderColor: string;
  badgeId: string;
  animaStep2Title: string;
  animaStep2Intro: string;
  animaStep2Bullets: string[];
}

export const MAIN_SUPPORT_TOPICS: MainSupportTopicConfig[] = [
  {
    key: 'depresion',
    name: 'Depresión',
    shortSubtitle: 'Reconectar con tu energía y pequeños momentos de luz',
    squareImageUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    emoji: '🌤️',
    accentColor: '#3B82F6',
    softBg: '#EFF6FF',
    borderColor: '#BFDBFE',
    badgeId: 'badge_luz_interior',
    animaStep2Title: 'Te acompañaré en tu proceso con la Depresión',
    animaStep2Intro:
      'Para ayudarte con la Depresión, llevaremos a cabo una serie de actividades agradables, interactivas y de movimiento suave que te ayudarán a reconectar con tu entorno y sentirte mejor poco a poco.',
    animaStep2Bullets: [
      'Avanza totalmente a tu propio ritmo: realiza cada actividad cuando sientas que lo necesitas, sin límite de días ni presiones.',
      'Tú decides la privacidad: al subir tu foto y comentario de cada actividad, puedes elegir publicarla en la comunidad o mantenerla privada solo para ti.',
      'Sin límite impuesto: tú decides hasta dónde parar. Cuando sientas que has logrado superarlo, recibirás tu Medalla de Luz Interior en tu Perfil.',
    ],
  },
  {
    key: 'ansiedad',
    name: 'Ansiedad',
    shortSubtitle: 'Calmar la mente y volver al momento presente',
    squareImageUrl:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
    emoji: '🌿',
    accentColor: '#0D9488',
    softBg: '#F0FDFA',
    borderColor: '#99F6E4',
    badgeId: 'badge_calma_mental',
    animaStep2Title: 'Te acompañaré a recuperar tu Calma ante la Ansiedad',
    animaStep2Intro:
      'Para ayudarte con la Ansiedad, realizaremos actividades prácticas, sensoriales y en movimiento que despejarán tu mente y te devolverán serenidad en el presente.',
    animaStep2Bullets: [
      'A tu propio ritmo: haz cada actividad cada vez que sientas que lo necesitas, sin relojes ni contadores obligatorios.',
      'Pública o privada: al registrar tu foto y reflexión del momento, podrás elegir entre compartirla con la comunidad o guardarla de forma privada.',
      'Tú decides cuándo concluir: cuando sientas que has recuperado tu calma, podrás cerrar esta etapa y recibir tu Medalla de Calma Mental.',
    ],
  },
  {
    key: 'estres',
    name: 'Estrés',
    shortSubtitle: 'Soltar la tensión acumulada y regalarte un respiro',
    squareImageUrl:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
    emoji: '🌊',
    accentColor: '#4F46E5',
    softBg: '#EEF2FF',
    borderColor: '#C7D2FE',
    badgeId: 'badge_paz_equilibrio',
    animaStep2Title: 'Te acompañaré a liberar el Estrés paso a paso',
    animaStep2Intro:
      'Para ayudarte a disminuir el Estrés, te propondré dinámicas divertidas, pausas activas y desconexiones saludables para soltar la sobrecarga del día.',
    animaStep2Bullets: [
      'Sin presiones ni fechas límite: realiza las actividades cuando lo necesites para despejarte y recargar energía.',
      'Privacidad a tu elección: al guardar tu fotografía y comentario, elige si deseas publicarla en Principal o conservarla en privado.',
      'Recompensa a tu constancia: tú decides hasta dónde llegar, y al concluir recibirás la Medalla de Paz y Equilibrio en tu Perfil.',
    ],
  },
  {
    key: 'amor_propio',
    name: 'Amor Propio',
    shortSubtitle: 'Celebrar quién eres, cuidarte y fortalecer tu autoestima',
    squareImageUrl:
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&auto=format&fit=crop&q=80',
    emoji: '💙',
    accentColor: '#2563EB',
    softBg: '#EFF6FF',
    borderColor: '#BFDBFE',
    badgeId: 'badge_amor_propio',
    animaStep2Title: 'Te acompañaré a fortalecer tu Amor Propio',
    animaStep2Intro:
      'Para cultivar tu Amor Propio, llevaremos a cabo actividades creativas, de autocuidado y movimiento que te recordarán tu gran valor todos los días.',
    animaStep2Bullets: [
      'A tu tiempo y sin prisas: realiza cada actividad cuando te nazca dedicarte un momento bonito para ti.',
      'Comparte o guarda para ti: al subir tu foto y comentario, selecciona si quieres publicarla en la comunidad o mantenerla privada.',
      'Tu medalla especial: tú decides cuándo has alcanzado tu meta personal para recibir la Medalla de Amor Propio.',
    ],
  },
];

export const OFFICIAL_STREAK_BADGES: StreakBadge[] = [
  {
    id: 'badge_luz_interior',
    level: 1,
    levelLabel: 'DEPRESIÓN SUPERADA',
    name: 'Medalla de Luz Interior',
    subtitle: 'Por reconectar con la vida paso a paso',
    description:
      'Otorgada por avanzar a tu propio ritmo y concluir con valentía tus actividades de apoyo para la Depresión.',
    emoji: '🌤️',
    icon: 'sunny',
    color: '#3B82F6',
    softBg: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  {
    id: 'badge_calma_mental',
    level: 2,
    levelLabel: 'ANSIEDAD SUPERADA',
    name: 'Medalla de Calma Mental',
    subtitle: 'Respira y habita el momento presente',
    description:
      'Otorgada por cultivar serenidad y concluir tu proceso de actividades frente a la Ansiedad.',
    emoji: '🌿',
    icon: 'leaf',
    color: '#0D9488',
    softBg: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  {
    id: 'badge_paz_equilibrio',
    level: 3,
    levelLabel: 'ESTRÉS SUPERADO',
    name: 'Medalla de Paz y Equilibrio',
    subtitle: 'Soltar la tensión y elegir tu bienestar',
    description:
      'Otorgada por regalarte pausas saludables y superar tu proceso de actividades contra el Estrés.',
    emoji: '🌊',
    icon: 'water',
    color: '#4F46E5',
    softBg: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  {
    id: 'badge_amor_propio',
    level: 4,
    levelLabel: 'AMOR PROPIO FORTALECIDO',
    name: 'Medalla de Amor Propio',
    subtitle: 'Celebrando tu valor y autenticidad',
    description:
      'Otorgada por dedicarte tiempo de calidad, cuidarte y completar tu camino de Amor Propio.',
    emoji: '💙',
    icon: 'heart',
    color: '#2563EB',
    softBg: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
];

export const normalizeTopicCategory = (
  cat?: EmotionalFocusCategory
): MainSupportTopicKey => {
  if (cat === 'ansiedad') return 'ansiedad';
  if (cat === 'estres' || cat === 'enojo') return 'estres';
  if (cat === 'amor_propio' || cat === 'inseguridad' || cat === 'felicidad') {
    return 'amor_propio';
  }
  return 'depresion';
};

export const getTopicConfig = (
  cat?: EmotionalFocusCategory
): MainSupportTopicConfig => {
  const key = normalizeTopicCategory(cat);
  return MAIN_SUPPORT_TOPICS.find((t) => t.key === key) || MAIN_SUPPORT_TOPICS[0];
};

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
  depresion: {
    title: 'Actividades de Apoyo • Depresión',
    shortProblemLabel: 'reconectando con mi energía y bienestar',
    subtitle: 'Actividades interactivas a tu propio ritmo para volver a conectar con lo que te hace bien.',
    emoji: '🌤️',
    color: '#3B82F6',
    softBg: '#EFF6FF',
    animaPrompt:
      'Realiza cada actividad cuando sientas que lo necesitas. Puedes guardar tu recuerdo en privado o compartirlo con la comunidad.',
    postTagText: 'Actividades de Mejora • Depresión',
  },
  ansiedad: {
    title: 'Actividades de Apoyo • Ansiedad',
    shortProblemLabel: 'cultivando calma y presencia',
    subtitle: 'Dinámicas sensoriales y en movimiento para despejar la mente a tu propio ritmo.',
    emoji: '🌿',
    color: '#0D9488',
    softBg: '#F0FDFA',
    animaPrompt:
      'Avanza sin prisas. Cada actividad está pensada para ayudarte a soltar el sobrepensamiento y volver al presente.',
    postTagText: 'Actividades de Mejora • Ansiedad',
  },
  estres: {
    title: 'Actividades de Apoyo • Estrés',
    shortProblemLabel: 'liberando tensión y recuperando mi paz',
    subtitle: 'Pausas activas y agradables para desconectarte de la rutina cuando lo necesites.',
    emoji: '🌊',
    color: '#4F46E5',
    softBg: '#EEF2FF',
    animaPrompt:
      'Date permiso de hacer una pausa. Elige cuándo realizar cada actividad y si deseas publicarla o guardarla solo para ti.',
    postTagText: 'Actividades de Mejora • Estrés',
  },
  amor_propio: {
    title: 'Actividades de Apoyo • Amor Propio',
    shortProblemLabel: 'fortaleciendo mi autoestima y autocuidado',
    subtitle: 'Experiencias creativas y alegres para celebrar quién eres día con día.',
    emoji: '💙',
    color: '#2563EB',
    softBg: '#EFF6FF',
    animaPrompt:
      'Este espacio es para celebrar tu vida a tu propio ritmo. Avanza hasta donde tú decidas y gana tu medalla.',
    postTagText: 'Actividades de Mejora • Amor Propio',
  },
  tristeza: {
    title: 'Actividades de Apoyo • Depresión',
    shortProblemLabel: 'reconectando con mi energía y bienestar',
    subtitle: 'Actividades interactivas a tu propio ritmo para volver a conectar con lo que te hace bien.',
    emoji: '🌤️',
    color: '#3B82F6',
    softBg: '#EFF6FF',
    animaPrompt:
      'Realiza cada actividad cuando sientas que lo necesitas.',
    postTagText: 'Actividades de Mejora • Depresión',
  },
  enojo: {
    title: 'Actividades de Apoyo • Estrés',
    shortProblemLabel: 'liberando tensión y recuperando mi paz',
    subtitle: 'Pausas activas y agradables para desconectarte de la rutina cuando lo necesites.',
    emoji: '🌊',
    color: '#4F46E5',
    softBg: '#EEF2FF',
    animaPrompt:
      'Date permiso de hacer una pausa a tu propio ritmo.',
    postTagText: 'Actividades de Mejora • Estrés',
  },
  inseguridad: {
    title: 'Actividades de Apoyo • Amor Propio',
    shortProblemLabel: 'fortaleciendo mi autoestima y autocuidado',
    subtitle: 'Experiencias creativas y alegres para celebrar quién eres día con día.',
    emoji: '💙',
    color: '#2563EB',
    softBg: '#EFF6FF',
    animaPrompt:
      'Este espacio es para celebrar tu vida a tu propio ritmo.',
    postTagText: 'Actividades de Mejora • Amor Propio',
  },
  felicidad: {
    title: 'Actividades de Apoyo • Amor Propio',
    shortProblemLabel: 'fortaleciendo mi autoestima y autocuidado',
    subtitle: 'Experiencias creativas y alegres para celebrar quién eres día con día.',
    emoji: '💙',
    color: '#2563EB',
    softBg: '#EFF6FF',
    animaPrompt:
      'Este espacio es para celebrar tu vida a tu propio ritmo.',
    postTagText: 'Actividades de Mejora • Amor Propio',
  },
};

type RawActivityTuple = [string, string, string];

/**
 * 100 ACTIVIDADES INTERACTIVAS, EN MOVIMIENTO Y AGRADABLES PARA DEPRESIÓN
 */
const DEPRESION_100: RawActivityTuple[] = [
  ['☀️', 'Sal a tomar 10 minutos de sol matutino', 'Camina hasta un balcón, patio o banqueta soleada, estira los brazos y captura cómo brilla la luz hoy.'],
  ['🎧', 'Baila una canción completa en tu habitación', 'Pon esa canción que siempre te levanta el ánimo, muévete libremente durante 3 minutos y tómate una foto sonriendo o de tu reproductor.'],
  ['🍳', 'Prepara un desayuno colorido y divertido', 'Cocina algo rico con frutas, pan tostado o huevos, acomódalo bonito en el plato como en restaurante y tómale foto.'],
  ['🚶', 'Caminata de 15 minutos buscando algo curioso', 'Sal a dar una vuelta corta por tu cuadra o parque y fotografía un árbol, fachada o detalle que nunca habías notado.'],
  ['🛏️', 'Renueva tu cama y abre las cortinas de par en par', 'Tiende tu cama con tu cobija favorita, deja entrar toda la luz natural y captura tu espacio renovado.'],
  ['☕', 'Prepara tu bebida caliente o fría favorita', 'Hazte un café espumoso, chocolate, té o smoothie casero, sírvelo en tu taza preferida y disfrútalo sin prisas.'],
  ['🌱', 'Riega y cuida una planta o jardín cercano', 'Dedica unos minutos a ponerle agua a tus plantas, limpiar sus hojas o visitar un área verde y fotografíala.'],
  ['🎨', 'Dibuja o colorea algo libre durante 10 minutos', 'Toma papel y colores o plumones, haz un dibujo sencillo o garabato creativo sin juzgar el resultado y compártelo.'],
  ['🐾', 'Tiempo de juego con tu mascota o animalito cercano', 'Juega, acaricia o pasea a tu mascota (o fotografía un pajarito o mascota del vecindario) y disfruta su compañía.'],
  ['🚿', 'Baño revitalizante con música alegre', 'Date una ducha tibia escuchando tus canciones favoritas, ponte ropa cómoda que te guste mucho y captura tu outfit o momento.'],
  ['🍊', 'Prepara un snack de frutas frescas picadas', 'Corta tu fruta favorita en trozos, agrégale tu toque preferido y disfruta sus colores y frescura.'],
  ['👟', 'Sal a dar 500 pasos escuchando un podcast o música', 'Ponte tus tenis más cómodos, sal a caminar unos minutos a tu ritmo y toma foto de tus tenis en el camino.'],
  ['🪟', 'Limpia y despeja tu mesa o escritorio personal', 'Guarda lo que no uses, deja solo lo que te inspire en tu mesa y toma foto del antes o después lleno de orden.'],
  ['📸', 'Busca 3 cosas de color azul en tu paseo', 'Sal a caminar o recorre tu casa buscando objetos o flores azules y captura tu favorito en una fotografía.'],
  ['🧁', 'Hornea o prepara un postre sencillo en taza (mugcake)', 'Mezcla ingredientes sencillos para un postre rápido y disfruta el aroma dulce en tu cocina.'],
  ['🧘', '5 minutos de estiramientos suaves de brazos y espalda', 'Levántate de la silla o cama, estira cuello, hombros y brazos hacia el techo y registra cómo se siente tu cuerpo.'],
  ['📚', 'Lee 3 páginas de un libro junto a la ventana', 'Busca el rincón más iluminado de tu casa, lee unas páginas que te inspiren y fotografía la portada o página.'],
  ['🎵', 'Crea una mini lista de 5 canciones que te dan energía', 'Selecciona 5 temas que te hagan mover la cabeza, escúchalos mientras ordenas algo y comparte tu selección.'],
  ['🌇', 'Sal a mirar el cielo al atardecer', 'Asómate o camina unos pasos al caer la tarde para observar los tonos del cielo y captura la vista.'],
  ['🥪', 'Prepara el sándwich o chapata más rico que se te ocurra', 'Combina tus ingredientes favoritos, córtalo en diagonal y disfruta cada bocado hecho por ti.'],
  ['🚲', 'Paseo corto en bici, patines o caminata ligera', 'Sal a mover las piernas al aire libre durante 15 minutos y captura un rincón bonito del recorrido.'],
  ['🕯️', 'Aromatiza tu cuarto y ordena un cajón pequeño', 'Enciende un aroma agradable o ventila tu cuarto, organiza un solo cajón y celebra ese avance concreto.'],
  ['🍋', 'Prepara agua fresca natural con hielo y rodajas de fruta', 'Hazte una jarra o vaso grande de limonada, naranjada o agua de sabor para hidratarte con gusto.'],
  ['🎭', 'Mira un video cómico que te haga reír a carcajadas', 'Dedica 10 minutos a ver comedia, stand-up o videos graciosos de animales y registra qué te hizo sonreír hoy.'],
  ['🌳', 'Ve a un parque y siéntate en una banca distinta', 'Camina hasta el parque más cercano, respira aire fresco bajo los árboles y toma foto del paisaje frente a ti.'],
  ['👕', 'Usa hoy esa prenda que guardabas para una ocasión especial', 'Ponte tu camisa, suéter o accesorio favorito solo por el gusto de verte bien hoy.'],
  ['🧩', 'Arma un rompecabezas, sudoku o juego de mesa rápido', 'Activa tu mente de forma divertida durante 15 minutos con un juego físico o de ingenio.'],
  ['🥞', 'Haz hotcakes o waffles con formas divertidas', 'Prepara mezcla de hotcakes, decóralos con fruta o miel y presume tu desayuno especial.'],
  ['🌿', 'Camina descalzo unos minutos sobre el pasto o tapete suave', 'Siente la textura bajo tus pies, estira los tobillos y conecta con tu cuerpo.'],
  ['📷', 'Fotografía la sombra más creativa que encuentres hoy', 'Sal a caminar cuando haya sol y juega a capturar sombras interesantes en el piso o la pared.'],
  ['🍿', 'Tarde de película animada o reconfortante con palomitas', 'Prepara un tazón de palomitas, acomoda tus almohadas y disfruta una historia que te deje buen sabor de boca.'],
  ['🎸', 'Toca un instrumento, canta o tararea tu canción favorita', 'Deja salir tu voz o toca unas notas sin importar la perfección; lo importante es expresarte.'],
  ['🥗', 'Prepara una ensalada o bowl lleno de texturas crujientes', 'Mezcla verduras frescas, semillas o fruta y dale a tu cuerpo energía ligera y deliciosa.'],
  ['🐕', 'Saluda con una sonrisa a alguien en tu caminata matutina', 'Sal a caminar 10 minutos, da los buenos días en tu ruta y captura una foto de tu paseo.'],
  ['🖼️', 'Cambia de lugar un cuadro o decoración de tu cuarto', 'Dale un aire nuevo a tu habitación moviendo un detalle decorativo para refrescar tu vista.'],
  ['🧊', 'Prepara cubos de hielo con trocitos de fruta o café', 'Haz hielos especiales para tus bebidas de la semana y disfruta prepararlos paso a paso.'],
  ['🏃', 'Camina a paso rápido durante 3 canciones seguidas', 'Pon 3 canciones movidas y camina al ritmo de la música por tu calle o parque cercano.'],
  ['✍️', 'Escribe 3 cosas pequeñas que sí te gustan de tu día', 'En una libreta bonita, anota tres detalles agradables (como el clima, tu café o tu música) y tómale foto.'],
  ['🌮', 'Prepara tus tacos o quesadillas favoritas con salsa casera', 'Cocina algo tradicional y delicioso, ponle aguacate o salsa y consiéntete hoy.'],
  ['🌸', 'Busca la flor más bonita de tu colonia y fotografíala', 'Sal a caminar con ojos de explorador hasta encontrar una flor llamativa en algún jardín o camellón.'],
  ['🧘‍♂️', 'Haz 10 respiraciones profundas abriendo los brazos', 'Inhala subiendo los brazos hacia el cielo y exhala bajándolos lentamente frente a una ventana abierta.'],
  ['🎲', 'Juega una partida rápida con alguien o en línea', 'Invita a un amigo, familiar o juega una partida amistosa que te saque una sonrisa.'],
  ['🍓', 'Congela fresas o uvas para un snack refrescante', 'Lava tu fruta favorita, métela unos minutos al congelador y disfruta un bocado fresco y dulce.'],
  ['🚶‍♀️', 'Explora una calle por la que casi nunca pasas', 'Cambia tu ruta habitual de caminata de 10 minutos para descubrir casas, árboles o tiendas nuevas.'],
  ['🛋️', 'Acomoda un rincón acogedor con cojines para descansar', 'Crea tu propio espacio cómodo de lectura o música y tómale una foto acogedora.'],
  ['🥤', 'Prepara un licuado energético de plátano, avena o cacao', 'Licúa ingredientes nutritivos y tómate tu batido después de estirarte un poco.'],
  ['🎈', 'Sacude todo el cuerpo durante 60 segundos como calentamiento', 'Ponte de pie, sacude manos, brazos y piernas para despertar tu energía física al instante.'],
  ['📓', 'Pega un recorte, sticker o dibujo en tu libreta', 'Personaliza una página en blanco con colores, stickers o frases que te levanten el ánimo.'],
  ['🌆', 'Caminata vespertina para ver encenderse las luces', 'Sal a dar un paseo corto justo cuando empiezan a prenderse las farolas y captura la escena.'],
  ['🍜', 'Prepara una sopa o caldo calientito que te reconforte', 'Cocina algo calientito que te abrace por dentro y disfrútalo con calma en la mesa.'],
  ['🏀', 'Lanza una pelota, encesta o rebótala durante 10 minutos', 'Si tienes una pelota en casa o parque, juega a lanzarla y atraparla para activar tus reflejos.'],
  ['🪴', 'Trasplanta un esqueje o pon una ramita en agua', 'Observa cómo nace una nueva raíz en un frasco de vidrio con agua junto a tu ventana.'],
  ['🎶', 'Escucha un álbum o género musical nuevo mientras caminas', 'Sal 15 minutos a caminar probando ritmos alegres como jazz, funk, pop o acústico.'],
  ['🥐', 'Ve caminando por un pan recién horneado a la panadería', 'Disfruta el paseo hasta la panadería local, elige tu pieza favorita y disfrútala en casa.'],
  ['🧹', 'Pon música movida y despeja el piso de tu habitación', 'Dedica solo 10 minutos con cronómetro a dejar el suelo libre y amplio para moverte a gusto.'],
  ['🌤️', 'Atrapa un rayo de sol entrando por tu ventana', 'Busca el ángulo donde entra el sol en tu casa, siéntate ahí 5 minutos y toma una foto artística.'],
  ['🍎', 'Prepara manzanas con canela o limón para media tarde', 'Un snack fácil, aromático y crujiente que te activa los sentidos al instante.'],
  ['🤸', 'Haz 10 giros suaves de cintura y hombros de pie', 'Desbloquea la rigidez de estar sentado o acostado moviendo tus articulaciones con suavidad.'],
  ['💌', 'Envía un mensaje bonito a alguien que aprecias', 'Manda un saludo sincero o un meme divertido a alguien especial para reconectar hoy.'],
  ['🏞️', 'Busca el árbol más grande de tu zona y obsérvalo de cerca', 'Camina hasta encontrar un árbol frondoso, mira sus ramas hacia arriba y toma una foto desde abajo.'],
  ['🍝', 'Cocina tu pasta favorita con tus especias preferidas', 'Disfruta el proceso de hervir la pasta, sazonarla a tu gusto y servirte un buen plato.'],
  ['🎨', 'Pinta una piedra pequeña con un diseño alegre', 'Busca una piedrita lisa en el jardín, píntale una carita o estrella y déjala en tu escritorio.'],
  ['🚶‍♂️', 'Subir y bajar escaleras a ritmo suave durante 3 minutos', 'Activa tu circulación subiendo escalones con calma mientras escuchas una canción motivadora.'],
  ['🍵', 'Prepara una infusión aromática de manzanilla, menta o frutos', 'Huele el vapor aromático de tu taza antes de dar el primer sorbo y relájate.'],
  ['📷', 'Toma una foto desde un ángulo diferente al habitual', 'Agáchate o levanta la cámara para capturar tu entorno como si fueras fotógrafo de revista.'],
  ['🧁', 'Decora unas galletas o pan tostado con figuras divertidas', 'Usa mermelada, crema de cacahuate o fruta para formar un diseño simpático en tu plato.'],
  ['🌬️', 'Abre todas las ventanas 10 minutos para renovar el aire', 'Deja que corra la brisa fresca por toda tu habitación mientras estiras los brazos.'],
  ['🎧', 'Baila frente al espejo tu coro favorito', 'Ponte frente al espejo, suelta una sonrisa y muévete al ritmo del coro más pegajoso que te guste.'],
  ['🥑', 'Prepara un guacamole o dip casero con totopos', 'Machaca aguacate con limón, sal y jitomate para disfrutar una botana fresca hecha por ti.'],
  ['🐕‍🦺', 'Sal a caminar observando los perros que pasean en el parque', 'Un paseo ligero al aire libre disfrutando la energía alegre de las mascotas del parque.'],
  ['📝', 'Haz una lista de 5 lugares sencillos que quieres visitar cerca', 'Anota cafeterías, parques, museos o miradores cercanos para tus próximas salidas.'],
  ['🤸‍♀️', 'Toca las puntas de tus pies o acércate suavemente 5 veces', 'Inhala profundo y al exhalar deja caer tus brazos hacia tus pies para soltar la espalda.'],
  ['🍍', 'Prueba una fruta que hace mucho tiempo no comías', 'Compra o parte una fruta distinta a la de siempre y disfruta su sabor fresco.'],
  ['🌅', 'Despierta y sal al patio o ventana antes de ver redes sociales', 'Regálate tus primeros 5 minutos del día mirando el cielo real y respirando aire limpio.'],
  ['🎵', 'Canta en la ducha o mientras preparas tu comida', 'Pon tu canción favorita a buen volumen y acompaña la letra de principio a fin.'],
  ['🧺', 'Dobla tu ropa limpia escuchando tu programa favorito', 'Convierte una tarea cotidiana en un momento ameno y deja tu espacio impecable.'],
  ['🌿', 'Huele hojas de menta, romero, café o cáscara de naranja', 'Estimula tu sentido del olfato con aromas naturales que despiertan el cerebro.'],
  ['🚶', 'Camina 10 minutos contando cuántas aves ves o escuchas', 'Presta atención a los sonidos de la naturaleza mientras das una vuelta tranquila.'],
  ['🥞', 'Prepara avena calientita con canela y trozos de manzana', 'Un plato reconfortante, nutritivo y lleno de aroma casero para empezar o cerrar el día.'],
  ['🖌️', 'Escribe una frase que te anime con letra grande y colorida', 'Usa marcadores o colores para diseñar tu propio cartel motivador en una hoja.'],
  ['👟', 'Limpia tus tenis favoritos y sal a estrenarlos de nuevo', 'Deja tus zapatos impecables y llévalos a dar una vuelta por tu lugar preferido.'],
  ['🌞', 'Haz 5 minutos de marcha suave en tu propio lugar', 'Levanta las rodillas suavemente al ritmo de una canción alegre para entrar en calor.'],
  ['🧀', 'Prepara una tabla sencilla de bocadillos para ti', 'Acomoda galletas, queso, fruta o semillas en un plato bonito como si fueras tu invitado de honor.'],
  ['🌳', 'Toca la corteza de un árbol o las hojas de una planta en tu paseo', 'Conecta físicamente con la naturaleza durante tu caminata del día.'],
  ['📖', 'Busca un poema o cuento corto y léelo en voz alta', 'Escucha tu propia voz dándole entonación a una lectura breve e inspiradora.'],
  ['🥤', 'Prepara un café helado o frappé casero en licuadora', 'Licúa hielo, leche y café o cacao para disfrutar una bebida refrescante hecha en casa.'],
  ['🕺', 'Inventa un paso de baile divertido de 10 segundos', 'Ríete un rato moviendo los hombros y los pies sin tomarte demasiado en serio.'],
  ['🛋️', 'Sacude tus almohadas y cambia las fundas por unas limpias', 'Prepárate para descansar delicioso esta noche en una cama fresca y acogedora.'],
  ['📷', 'Captura el reflejo de algo bonito en un charco, vidrio o taza', 'Juega con la fotografía buscando reflejos curiosos en tu casa o en la calle.'],
  ['🌮', 'Cocina una receta rápida de 3 ingredientes que te encante', 'Mantén la cocina sencilla y sabrosa preparando algo práctico con tus manos.'],
  ['🚶‍♀️', 'Da una vuelta a la manzana caminando un poco más ligero', 'Siente cómo tu corazón se activa suavemente y tu respiración se vuelve más profunda.'],
  ['🌻', 'Regálate una flor o ramita verde para poner en tu mesa', 'Pon un toque de vida natural en el lugar donde pasas más tiempo del día.'],
  ['🎧', 'Escucha las canciones que te hacían feliz en tu infancia', 'Haz un viaje musical lleno de nostalgia bonita mientras caminas o recoges tu cuarto.'],
  ['🧘', 'Siéntate derecho, junta los omóplatos 5 segundos y suelta', 'Repite este movimiento 5 veces para abrir el pecho y mejorar tu postura y ánimo.'],
  ['🍉', 'Hidrata tu cuerpo tomando un vaso completo de agua fresca', 'Acompaña tu vaso de agua con unos pasos por tu casa mirando por la ventana.'],
  ['🎲', 'Aprende un truco sencillo con las manos, cartas o moneda', 'Diviértete practicando coordinación durante 10 minutos hasta que te salga.'],
  ['🌇', 'Sal a caminar 10 minutos después de comer', 'Ayuda a tu cuerpo a digerir y despejar la pesadez de la tarde con aire fresco.'],
  ['🥣', 'Prepara yogur con fruta y granola crujiente', 'Mezcla sabores dulces y crujientes en un tazón bonito y disfrútalo sin prisa.'],
  ['✨', 'Ordena tu rincón favorito y ponle una luz cálida', 'Prende una lámpara suave o vela artificial para crear un ambiente tranquilo al anochecer.'],
  ['🌤️', 'Sal al exterior, mira lo lejos que llega el horizonte y respira', 'Amplía tu mirada hacia el cielo abierto y celebra haberte regalado este momento hoy.'],
];

/**
 * 100 ACTIVIDADES INTERACTIVAS, SENSORIALES Y EN MOVIMIENTO PARA ANSIEDAD
 */
const ANSIEDAD_100: RawActivityTuple[] = [
  ['🌿', 'Técnica 5-4-3-2-1 caminando al aire libre', 'Sal a caminar y encuentra 5 cosas que puedas ver, 4 que puedas tocar, 3 que escuches, 2 que huelas y 1 que saborees. Sube foto de tu favorita.'],
  ['🫁', 'Respiración cuadrada frente a una ventana abierta', 'Inhala en 4 segundos, sostén 4, exhala en 4 y espera 4 frente al aire fresco. Captura la vista desde tu ventana.'],
  ['🚶', 'Caminata consciente sintiendo cada paso en el suelo', 'Sal 15 minutos sin mirar el celular, prestando atención al contacto de tus pies con el piso, y toma una foto al final.'],
  ['🧊', 'Refresca tus manos y muñecas con agua fría durante 1 minuto', 'Deja correr agua fresca sobre tus muñecas para bajar las revoluciones del sistema nervioso al instante.'],
  ['🎨', 'Dibuja espirales o patrones repetitivos con música suave', 'Llena una hoja de ondas, círculos o mandalas libres siguiendo el ritmo de tu respiración.'],
  ['🍵', 'Prepara un té tibio y concéntrate en el calor de la taza', 'Sostén la taza con ambas manos, siente su temperatura y da sorbos pequeños y pausados.'],
  ['🌳', 'Camina bajo los árboles observando cómo se mueven las hojas', 'Ve a un parque o calle arbolada, mira el movimiento suave de las ramas con el viento y fotografíalo.'],
  ['🧘', 'Estiramiento lento de cuello y hombros en círculo', 'Gira tus hombros hacia atrás 10 veces muy despacio soltando toda la rigidez acumulada.'],
  ['🎧', 'Escucha sonidos de lluvia, bosque o mar mientras ordenas algo', 'Pon audio de naturaleza y dedica 10 minutos a acomodar un espacio pequeño con movimientos tranquilos.'],
  ['🦶', 'Ponte de pie y balancea tu peso de puntas a talones 15 veces', 'Ancla tu atención en tus piernas y pies sintiendo el equilibrio de tu cuerpo en el presente.'],
  ['✍️', 'Vuelca tus pensamientos en una hoja para vaciar la mente', 'Escribe todo lo que traes en la cabeza sin filtro durante 5 minutos para sacarlo del pensamiento y darle descanso.'],
  ['🪴', 'Toca la tierra o las hojas de tus plantas con atención', 'Siente la textura natural de las hojas o trasplanta una maceta pequeña usando tus manos.'],
  ['🚶‍♀️', 'Caminata lenta contando tus pasos del 1 al 100', 'Sal a dar una vuelta tranquila llevando la cuenta de tus pasos para mantener tu mente en el aquí y ahora.'],
  ['🍋', 'Huele profundamente medio limón, naranja o café en grano', 'Usa un aroma cítrico o tostado intenso para traer tus sentidos de regreso al momento presente.'],
  ['🧩', 'Arma un bloque de piezas, origami o figura de papel', 'Sigue pasos sencillos con tus manos para doblar un barco, avión o grulla de papel y fotografíalo.'],
  ['🌬️', 'Sopla suavemente como si hicieras burbujas imaginarias', 'Haz 8 exhalaciones largas y lentas por la boca para activar tu calma natural.'],
  ['📷', 'Fotografía un detalle diminuto de la naturaleza (una hoja o flor)', 'Acércate a observar las nervaduras de una hoja o los pétalos de una flor y captúrala en primer plano.'],
  ['🥣', 'Cocina algo mezclando ingredientes despacio con cuchara de madera', 'El movimiento rítmico de mezclar una masa, avena o sopa ayuda a serenar el ritmo mental.'],
  ['🤸', 'Posición del niño o estiramiento de espalda en tapete', 'Estira tus brazos hacia adelante sobre un tapete o cama y respira profundo en tu espalda baja.'],
  ['🌅', 'Observa el movimiento de las nubes durante 5 minutos', 'Sal al patio o parque, mira cómo cambian de forma las nubes en el cielo y tómales una foto.'],
  ['💧', 'Bebe un vaso de agua fresca en 10 sorbos conscientes', 'Siente cómo pasa el agua fresca en cada sorbo sin prisa alguna.'],
  ['🧹', 'Barre o limpia una superficie con movimientos rítmicos', 'Concentra tu atención en dejar impecable una mesa o rincón mientras respiras con calma.'],
  ['🎵', 'Escucha una pieza instrumental de piano o guitarra acústica', 'Camina por tu habitación o jardín siguiendo la melodía suave sin distracciones.'],
  ['🤲', 'Date un automasaje en las palmas de las manos y dedos', 'Presiona suavemente el centro de cada palma con el pulgar contrario durante 3 minutos.'],
  ['🐕', 'Acaricia el pelaje de tu mascota con movimientos lentos', 'Concéntrate en la suavidad y el ritmo tranquilo de su respiración junto a ti.'],
  ['🚶‍♂️', 'Sal a caminar dejando el teléfono en modo avión 15 minutos', 'Regálate un paseo libre de notificaciones y toma solo una foto de lo que más paz te dio.'],
  ['🕯️', 'Observa la luz cálida de una lámpara o vela mientras respiras', 'Baja las luces fuertes de tu cuarto y descansa la vista durante 10 minutos.'],
  ['🥗', 'Pica verduras o frutas concentrándote en sus colores y aromas', 'Convierte la preparación de tu comida en un ejercicio de atención plena y calma.'],
  ['🧘‍♀️', 'Levanta los hombros hacia las orejas, tensa 3 segundos y suelta', 'Repite 5 veces dejando caer los hombros de golpe al exhalar para notar el alivio físico.'],
  ['📚', 'Hojea un libro de fotografía, arte o naturaleza', 'Disfruta mirar imágenes hermosas en papel sin pantallas brillantes por un rato.'],
  ['🌿', 'Camina por un sendero o banqueta tranquila al caer la tarde', 'Aprovecha la frescura de la tarde para despejar el exceso de pensamientos del día.'],
  ['🎨', 'Colorea con lápices de madera usando tonos verdes y azules', 'Los tonos fríos y suaves ayudan a relajar la vista y enfocar tus manos en el papel.'],
  ['☕', 'Prepara una infusión sin cafeína (tila, lavanda o manzanilla)', 'Disfruta el ritual completo desde calentar el agua hasta el último sorbo.'],
  ['🦶', 'Rueda una pelota pequeña bajo la planta de cada pie', 'Masajea tus pies durante 5 minutos sentado o de pie para liberar tensión física.'],
  ['📸', 'Busca y fotografía algo perfectamente simétrico en tu entorno', 'Entrena tu mirada tranquila encontrando equilibrio visual en una ventana, planta o camino.'],
  ['🧺', 'Organiza tus libros o cuadernos por tamaño o color', 'Una actividad visual y ordenada que le da sensación de estructura y paz a tu mente.'],
  ['🌬️', 'Exhala haciendo un sonido suave de "shhh" durante 6 segundos', 'Repite 6 veces mientras estiras tus brazos para relajar el pecho y el abdomen.'],
  ['🥖', 'Amasa pan, plastilina o masa casera con tus manos', 'Siente la textura moldeable entre tus dedos para descargar la inquietud motora.'],
  ['🌳', 'Apoya tu espalda contra un árbol o pared firme y respira', 'Siente el soporte sólido detrás de ti durante 2 minutos mientras inhalas aire fresco.'],
  ['🎧', 'Camina escuchando música a tempo lento (60-70 BPM)', 'Adapta el ritmo de tus pasos a una canción tranquila para desacelerar tu cuerpo.'],
  ['🍊', 'Pela una mandarina o naranja lentamente con las manos', 'Disfruta el aroma cítrico que se desprende de la cáscara y saborea cada gajo con calma.'],
  ['🧘', 'Gira tu torso suavemente de izquierda a derecha 10 veces', 'Con los pies firmes en el suelo, deja que tus brazos acompañen el giro suave de tu cintura.'],
  ['📓', 'Haz una lista de "Lo que sí está en mis manos hoy"', 'Anota 3 acciones sencillas que sí dependen de ti hoy y suelta lo demás.'],
  ['🌇', 'Sal a ver cómo cambia la luz del día al atardecer', 'Observa la transición suave de colores en el cielo desde tu ventana o parque.'],
  ['🚿', 'Date un baño tibio enfocándote en el sonido del agua', 'Escucha caer el agua y siente cómo relaja tu nuca y tu espalda.'],
  ['🧶', 'Teje, haz nudos de macramé o trenza tres hilos de colores', 'Mantén tus dedos ocupados en un patrón rítmico y relajante.'],
  ['🚶', 'Camina en línea recta imaginaria poniendo un pie frente a otro', 'Un ejercicio de equilibrio divertido que concentra toda tu atención en tu cuerpo.'],
  ['🍵', 'Prepara un matcha, chai suave o leche tibia con miel y canela', 'Concéntrate en mezclar la espuma y disfrutar su textura reconfortante.'],
  ['🪴', 'Limpia hoja por hoja tu planta favorita con un paño húmedo', 'Un gesto de cuidado pausado que deja tus plantas brillantes y tu mente serena.'],
  ['📷', 'Toma una foto del lugar donde te sientes más tranquilo en casa', 'Acomoda ese rincón a tu gusto y guárdalo como tu refugio de calma.'],
  ['🤸‍♂️', 'Estira tus brazos entrelazando los dedos hacia adelante y arriba', 'Alarga tu columna vertebral mientras tomas una inhalación profunda.'],
  ['🎶', 'Tararea una melodía suave sintiendo la vibración en tu pecho', 'Tararear activa el nervio vago y transmite una señal inmediata de seguridad al cuerpo.'],
  ['🥒', 'Prepara agua con rodajas de pepino y menta fresca', 'Disfruta una bebida limpia, fresca y relajante después de estirar tu cuerpo.'],
  ['🚶‍♀️', 'Sal a caminar mirando hacia las copas de los árboles y techos', 'Levanta la vista del suelo para ampliar tu perspectiva y respirar mejor.'],
  ['🖌️', 'Pinta con acuarelas o agua sobre papel viendo cómo se expande', 'Observa cómo fluye el color con el agua sin intentar controlarlo todo.'],
  ['🛋️', 'Recuéstate con las piernas apoyadas en la pared 5 minutos', 'Esta postura ayuda a descansar las piernas y bajar el ritmo cardíaco rápidamente.'],
  ['🌿', 'Ordena tu escritorio dejando únicamente 3 objetos esenciales', 'Menos ruido visual alrededor se traduce en más claridad y calma interior.'],
  ['🎲', 'Resuelve un laberinto, sopa de letras o crucigrama sencillo', 'Enfoca tu mente en un pasatiempo tranquilo y concreto durante 10 minutos.'],
  ['🌤️', 'Sal al balcón o jardín y siente la temperatura de la brisa en tu rostro', 'Cierra los ojos 30 segundos identificando de qué dirección viene el viento.'],
  ['🥣', 'Desgrana un elote, chícharos o granada con paciencia', 'Una tarea manual entretenida que te mantiene anclado en el presente.'],
  ['🧘', 'Abraza tus propios hombros cruzando los brazos y balancea suave', 'El abrazo de mariposa es una técnica excelente para brindarte calma inmediata.'],
  ['📷', 'Fotografía tres texturas distintas (madera, hoja, piedra)', 'Sal a tocar y observar las superficies naturales que hay cerca de ti.'],
  ['🚶‍♂️', 'Da un paseo tranquilo por una calle silenciosa o jardín', 'Elige el camino con menos ruido para regalarle descanso auditivo a tu mente.'],
  ['🫖', 'Escucha cómo hierve el agua para tu infusión sin prisas', 'Observa el vapor subir y disfruta la pausa antes de servir tu taza.'],
  ['🤸', 'Abre y cierra las manos estirando bien los dedos 15 veces', 'Libera la tensión que suele acumularse en las manos y antebrazos.'],
  ['📖', 'Lee en voz baja y pausada un capítulo corto que te guste', 'Sigue cada renglón con tu dedo para mantener tu atención enfocada y tranquila.'],
  ['🌱', 'Siembra unas semillas en una maceta pequeña con tierra fresca', 'Usa tus manos para cubrir las semillas y regarlas con suavidad.'],
  ['🎧', 'Escucha el canto de aves reales o en audio mientras estiras', 'El sonido de las aves le indica naturalmente a nuestro cerebro que el entorno es seguro.'],
  ['🧁', 'Prepara galletas de avena y plátano amasando con tenedor', 'Solo 2 o 3 ingredientes sencillos para disfrutar el aroma del horno en casa.'],
  ['🪟', 'Abre tu ventana y cuenta 5 sonidos lejanos distintos', 'Distingue sonidos a la distancia sin engancharte con ninguno, solo escuchando.'],
  ['👟', 'Camina 10 minutos coordinando 3 pasos al inhalar y 4 al exhalar', 'Sincroniza tu caminata con tu respiración para entrar en un ritmo sereno.'],
  ['🖼️', 'Dibuja el contorno de tu mano y escribe dentro qué te da paz', 'En cada dedo anota una actividad, persona o lugar que te transmite tranquilidad.'],
  ['🚿', 'Lávate la cara con agua fresca y sécala con toques suaves', 'Un reinicio físico inmediato para despejar la mente a mitad del día.'],
  ['🌿', 'Haz un pequeño ramo con hojas o flores caídas en tu paseo', 'Recoge elementos bonitos del suelo durante tu caminata y acomódalos en casa.'],
  ['🧘‍♂️', 'Inhala inflando el abdomen como un globo y suelta despacio', 'Coloca una mano en tu abdomen para sentir cómo sube y baja con calma.'],
  ['🍵', 'Toma tu bebida favorita sentado sin revisar ninguna pantalla', 'Regálate 10 minutos de presencia total disfrutando el sabor de tu bebida.'],
  ['🚶', 'Camina alrededor de una fuente o espejo de agua si tienes uno cerca', 'Observa las ondas del agua y escucha su sonido relajante.'],
  ['🎨', 'Haz puntillismo o llena un dibujo con pequeños puntos de color', 'El ritmo suave de hacer puntos con un plumón relaja la mente profundamente.'],
  ['🛏️', 'Ventila tus cobijas y acomoda tu cama con calma', 'Movimientos amplios y pausados para dejar tu lugar de descanso impecable.'],
  ['📷', 'Captura una foto del cielo azul o de las nubes de hoy', 'Mira hacia arriba, respira hondo y guarda la postal del cielo de este momento.'],
  ['🤸‍♀️', 'inclina tu cabeza suavemente hacia cada hombro 15 segundos', 'Alarga los músculos laterales del cuello mientras exhalas por la boca.'],
  ['🥪', 'Prepara un tostado de aguacate o fruta paso a paso', 'Concéntrate en cortar, untar y decorar tu plato con tranquilidad.'],
  ['🌳', 'Camina descalzo sobre una alfombra o césped sintiendo el apoyo', 'Nota cómo tus pies sostienen todo tu cuerpo con firmeza en el presente.'],
  ['🎵', 'Pon una canción suave y mueve tus brazos como si flotaran en agua', 'Un movimiento fluido de tai-chi casero para soltar la rigidez corporal.'],
  ['📓', 'Dibuja cómo se ve tu calma hoy usando formas y colores', 'Expresa visualmente la tranquilidad que estás construyendo paso a paso.'],
  ['🍋', 'Prepara una infusión fría de agua con rodajas de naranja y romero', 'Aromas frescos y herbales para hidratarte con calma durante el día.'],
  ['🚶‍♀️', 'Da una vuelta corta observando los colores de las fachadas', 'Nota las tonalidades de tu calle como si la vieras por primera vez.'],
  ['🤲', 'Frota tus palmas hasta que estén calientitas y apóyalas sobre tus ojos', 'Descansa tus ojos cerrados en la calidez de tus manos durante 60 segundos.'],
  ['🪴', 'Rocía agua con atomizador sobre las hojas de una planta', 'Observa las pequeñas gotas brillar sobre el verde de las hojas.'],
  ['🧘', 'Siéntate en el suelo con piernas cruzadas y alarga la espalda', 'Respira profundo 5 veces sintiendo tu base estable y segura.'],
  ['📷', 'Fotografía un objeto cotidiano que te traiga un buen recuerdo', 'Busca en tu habitación algo que te conecte con un momento feliz y tranquilo.'],
  ['🚶', 'Camina 12 minutos al ritmo de una caminata de paseo dominical', 'Sin prisa por llegar a ningún lado, disfrutando simplemente el movimiento.'],
  ['🍵', 'Prepara un tazón de fruta tibia con canela', 'El calor suave y el aroma de la canela brindan calma reconfortante.'],
  ['🌬️', 'Haz 5 suspiros fisiológicos (doble inhalación y exhalación larga)', 'Inhala dos veces seguidas por la nariz y suelta un suspiro largo por la boca.'],
  ['🧩', 'Ordena tu cajón de accesorios o papelería con tranquilidad', 'Disfruta poner cada cosa en su sitio sin prisa alguna.'],
  ['🌅', 'Sal a respirar el aire fresco de la mañana o del anochecer', 'Siente cómo entra aire nuevo a tus pulmones y renueva tu claridad.'],
  ['🎨', 'Traza líneas suaves de lado a lado de una hoja respirando lento', 'Inhala al trazar una línea y exhala al trazar la siguiente.'],
  ['🤸', 'Sacude suavemente tus manos como si secaras gotas de agua', 'Libera la energía acumulada en los brazos durante 30 segundos.'],
  ['🌿', 'Sal a caminar unos minutos y fotografía tu rincón verde favorito', 'Conecta con la serenidad de las plantas y árboles de tu entorno.'],
  ['🌤️', 'Haz una pausa, pon una mano en el pecho y agradece tu avance hoy', 'Reconoce con cariño cada paso que das para cuidar tu paz mental.'],
];

/**
 * 100 ACTIVIDADES INTERACTIVAS, DIVERTIDAS Y LIBERADORAS PARA ESTRÉS
 */
const ESTRES_100: RawActivityTuple[] = [
  ['⚡', 'Sacude brazos y piernas al ritmo de una canción enérgica', 'Ponte de pie 3 minutos, suelta toda la tensión acumulada moviendo el cuerpo y captura tu momento de pausa activa.'],
  ['🚶', 'Caminata de desconexión total de 15 minutos sin pendientes', 'Cierra tus tareas por un rato, sal a caminar al aire libre y fotografía algo que te haga sentir libre de prisas.'],
  ['🥊', '10 minutos de cardio ligero, saltos suaves o baile libre', 'Libera endorfinas y descarga el estrés del día moviéndote con tu música favorita.'],
  ['🚿', 'Ducha renovadora imaginando que el agua se lleva la tensión', 'Date un baño relajante al terminar tus deberes y ponte tu ropa más cómoda de descanso.'],
  ['☕', 'Pausa de cafetería: 15 minutos sin hablar de trabajo ni escuela', 'Prepara tu bebida favorita, siéntate en otro lugar de la casa o jardín y disfruta tu recreo personal.'],
  ['🧘', 'Estiramiento completo de espalda, pecho y piernas de 5 minutos', 'Despega la vista de las pantallas, levántate y estira cada músculo que estuvo tenso hoy.'],
  ['🎵', 'Canta a todo pulmón esa canción que te libera la garganta', 'Pon tu tema favorito y cántalo con ganas mientras caminas por tu cuarto o cocinas.'],
  ['🌳', 'Sal a caminar al parque más cercano a paso ligero', 'Cambia el techo por el cielo abierto durante 15 minutos para oxigenar tu mente.'],
  ['🍋', 'Prepara un mocktail o bebida refrescante con hielo y limón', 'Sirve agua mineral o natural con hielo, fruta y limón en un vaso bonito para celebrar el fin de tu jornada.'],
  ['🧹', 'Despeja tu mesa de trabajo guardando todo lo terminado', 'Da por cerrado el estrés del día dejando tu superficie limpia y libre para descansar.'],
  ['🐾', 'Sal a pasear o jugar a la pelota con tu mascota', 'Contágiate de su alegría y olvídate del reloj mientras juegan un rato.'],
  ['🍿', 'Noche de comedia: mira un episodio que te haga reír de verdad', 'La risa reduce el cortisol de inmediato; prepárate una botana y diviértete.'],
  ['🤸', 'Haz 15 círculos amplios con los brazos hacia adelante y atrás', 'Suelta la carga de los hombros y la espalda alta poniéndote de pie ahora mismo.'],
  ['🎨', 'Garabatea o pinta con trazos libres y rápidos en una hoja', 'Descarga la presión en el papel usando tus colores favoritos sin reglas ni moldes.'],
  ['🚲', 'Sal a rodar en bici o caminar por una avenida amplia', 'Siente el viento en la cara y deja atrás el encierro por unos minutos.'],
  ['🌮', 'Cocina tu cena favorita escuchando música alegre', 'Cambia el chip del día preparando algo delicioso con tus propias manos.'],
  ['🌬️', 'Inhala profundo y suelta el aire con un "aaah" liberador 5 veces', 'Deja caer los hombros al exhalar para soltar la mandíbula y el cuello.'],
  ['📷', 'Sal a tomar 3 fotos de cosas bonitas que veas fuera de casa', 'Regálale a tu vista paisajes reales lejos del brillo del monitor o celular.'],
  ['🧊', 'Pasa un cubo de hielo o agua fría por tu rostro y nuca', 'Refresca tu cabeza después de un rato de mucha concentración o calor.'],
  ['🎲', 'Juega 15 minutos a algo puramente divertido sin competir', 'Dedica un rato a un juego de mesa, cartas o videojuego ligero que te entretenga.'],
  ['🌿', 'Cuida tus plantas o arregla un rincón del jardín', 'Cambiar la actividad mental por una actividad manual con plantas despeja el estrés.'],
  ['🦶', 'Quítate los zapatos y estira los dedos de los pies sobre un tapete', 'Libera tus pies del calzado del día y camina cómodo por tu habitación.'],
  ['🥤', 'Prepara un smoothie helado de frutas tropicales', 'Licúa hielo con mango, piña o fresa para darte un gusto refrescante.'],
  ['🚶‍♀️', 'Toma el camino largo de regreso o da una vuelta extra a la cuadra', 'Usa esos 10 minutos extra de caminata como puente entre tus pendientes y tu descanso.'],
  ['🧘‍♂️', 'Masajea tus sienes y mandíbula con movimientos circulares suaves', 'Afloja los músculos de la cara donde suele guardarse el estrés sin darnos cuenta.'],
  ['🎶', 'Baila 2 canciones seguidas como si estuvieras en una fiesta', 'Suelta el cuerpo, mueve los brazos y cambia tu energía en menos de 7 minutos.'],
  ['📓', 'Anota tus pendientes en un papel y cierra la libreta hasta mañana', 'Saca las tareas de tu cabeza dejándolas por escrito para poder desconectarte hoy.'],
  ['🌅', 'Sal a ver el atardecer sin llevar nada en las manos', 'Solo tú respirando aire fresco y viendo caer el sol durante 10 minutos.'],
  ['🥪', 'Come hoy en un lugar distinto (patio, terraza o comedor despejado)', 'Nunca comas frente al trabajo; regálate un cambio de escenario para disfrutar tus alimentos.'],
  ['🏀', 'Rebota una pelota o haz malabares con 2 naranjas o pelotitas', 'Un reto físico ligero y divertido que corta de raíz la tensión mental.'],
  ['🍵', 'Prepara una infusión relajante y tómala mirando por la ventana', 'Cambia la prisa por 10 minutos de calma viendo pasar las nubes o los árboles.'],
  ['🤸‍♀️', 'Estira el cuello llevando la oreja al hombro y sostén 20 segundos', 'Hazlo de ambos lados respirando lento para liberar el trapecio.'],
  ['🎧', 'Escucha tu playlist de carretera o viaje mientras caminas', 'Sal a dar una vuelta sintiendo la emoción de ir descubriendo el camino.'],
  ['🧁', 'Prepara una botana crujiente (palomitas, nueces o fruta picada)', 'Masticar alimentos crujientes y saludables ayuda a liberar tensión mandibular.'],
  ['🛋️', 'Recuéstate 10 minutos en el sillón o hamaca sin hacer absolutamente nada', 'Practica el arte de descansar sin culpa; tu mente y cuerpo lo merecen.'],
  ['📷', 'Fotografía el cielo abierto desde el punto más despejado que tengas', 'Mira la amplitud del cielo para recordar que tus pendientes son solo una pequeña parte del día.'],
  ['🚶‍♂️', 'Camina 10 minutos moviendo los brazos con soltura', 'Evita caminar con los brazos rígidos o cruzados; déjalos balancearse libremente.'],
  ['🌱', 'Huele tierra húmeda, café recién hecho o hierbas frescas', 'Conecta con aromas naturales que relajan los sentidos de inmediato.'],
  ['🎸', 'Practica un hobby manual durante 15 minutos (música, dibujo, cocina)', 'Usar las manos en algo creativo apaga el ruido del estrés cotidiano.'],
  ['💧', 'Toma un vaso grande de agua y estira la espalda hacia atrás', 'Hidrátate y abre el pecho después de haber estado inclinado hacia adelante.'],
  ['🕺', 'Haz una pausa de 3 minutos para moverte cada hora pesada', 'Ponte de pie, da unos pasos por la casa y toma foto de tu pausa saludable.'],
  ['🍊', 'Disfruta una fruta cítrica fresca al sol o junto a la ventana', 'Un impulso natural de vitamina y frescura para renovar tu tarde.'],
  ['🧹', 'Ordena solo 5 objetos que estén fuera de su lugar', 'Un entorno más despejado reduce la sobrecarga visual en segundos.'],
  ['🧘', 'Haz 5 respiraciones profundas subiendo los brazos al inhalar', 'Al exhalar baja los brazos lentamente como si empujaras el aire hacia abajo.'],
  ['🐕‍🦺', 'Observa aves o mascotas en el parque durante 10 minutos', 'Deja que tu atención descanse en la naturaleza viva que te rodea.'],
  ['🍝', 'Cocina algo rico sin prisa probando un condimento nuevo', 'Disfruta los olores y sabores de tu cocina como terapia de desconexión.'],
  ['👟', 'Sal a caminar 15 minutos al ritmo que más cómodo sienta tu cuerpo', 'No es una carrera; camina por el puro placer de estirar las piernas.'],
  ['🕯️', 'Apaga las luces blancas del techo y usa solo luz suave al anochecer', 'Prepara tu ambiente para que tu cerebro sepa que ya es hora de descansar.'],
  ['🎨', 'Moldea plastilina, arcilla o masa casera durante 10 minutos', 'Apretar y dar forma con las manos descarga toda la tensión acumulada en los dedos.'],
  ['🌊', 'Lava tus manos con agua tibia y jabón aromático muy despacio', 'Siente la espuma y el agua tibia como un pequeño spa de 2 minutos.'],
  ['📖', 'Lee algo por puro entretenimiento (novela, cómic, revista)', 'Desconéctate de lecturas obligatorias y disfruta una historia divertida.'],
  ['🤸', 'Ponte de puntillas 10 veces seguidas estirando las pantorrillas', 'Activa el retorno venoso de tus piernas después de estar sentado o de pie.'],
  ['🍵', 'Prepara un té helado casero con hielo y limón', 'Refresca tu garganta y tómate un descanso bien merecido.'],
  ['📷', 'Sal a buscar la vista más verde cerca de tu casa y fotografíala', 'El color verde de los árboles y plantas relaja el nervio óptico y baja el estrés.'],
  ['🎵', 'Toca un ritmo con tus manos sobre la mesa o tus piernas', 'Sigue el compás de una canción alegre para liberar energía con ritmo.'],
  ['🛏️', 'Estírate como gato al despertar o antes de dormir en tu cama', 'Alarga brazos y piernas en direcciones opuestas y suelta un bostezo grande.'],
  ['🥗', 'Prepara una cena ligera y colorida que te caiga muy bien', 'Cuidar lo que cenas te regala un sueño mucho más reparador.'],
  ['🚶‍♀️', 'Camina 10 minutos respirando únicamente por la nariz', 'Una caminata suave manteniendo la respiración nasal serena todo el cuerpo.'],
  ['🌻', 'Limpia y acomoda tu rincón favorito para el fin de día', 'Ten listo el lugar donde te sentarás a descansar hoy por la tarde o noche.'],
  ['🎧', 'Escucha una canción que te haga sonreír desde los primeros segundos', 'Guarda esa canción como tu himno oficial para cortar el estrés.'],
  ['🧘‍♀️', 'Entrelaza tus manos detrás de la espalda y abre el pecho 15 segundos', 'Contrarresta la postura encorvada y llena tus pulmones de aire fresco.'],
  ['🍉', 'Come un tazón de fruta fresca bien fría', 'Disfruta la dulzura natural y el efecto refrescante en tu descanso.'],
  ['🎲', 'Haz 3 intentos de encestar una bolita de papel en el bote', 'Convierte un minuto cualquiera en un pequeño juego divertido.'],
  ['🌇', 'Sal a caminar cuando baje el calor del día y disfruta la brisa', 'Siente cómo cambia el ambiente de la tarde mientras das una vuelta tranquila.'],
  ['🖌️', 'Colorea o sombrea un dibujo sencillo sin preocuparte por salirte de la raya', 'Date permiso de hacer algo imperfecto y relajado.'],
  ['🥤', 'Prepara agua mineral con un toque de jugo de naranja o arándano', 'Una bebida burbujeante y alegre para acompañar tu pausa del día.'],
  ['🌳', 'Siéntate bajo la sombra de un árbol a respirar tranquilo', 'Regálate 10 minutos lejos del ruido en un espacio con vegetación.'],
  ['🤸‍♂️', 'Gira tus tobillos y muñecas 10 veces hacia cada lado', 'Suelta las articulaciones periféricas para sentir el cuerpo más ligero.'],
  ['💌', 'Comparte una risa o anécdota graciosa con alguien hoy', 'Reír acompañado multiplica el alivio y aligera cualquier día pesado.'],
  ['📷', 'Toma una foto de tu bebida o snack de descanso de hoy', 'Celebra el momento en que decidiste hacer una pausa por tu bienestar.'],
  ['🚶', 'Camina 15 minutos dejando que tu mirada descanse a lo lejos', 'Relaja los músculos de tus ojos mirando objetos a más de 20 metros de distancia.'],
  ['🥣', 'Prepara tu desayuno o merienda favorita sin mirar el reloj', 'Disfruta cada paso de la preparación a un ritmo calmado y placentero.'],
  ['🌬️', 'Haz 6 exhalaciones que duren el doble de tiempo que tu inhalación', 'Inhala en 3 segundos y exhala suavemente en 6 segundos para relajar el cuerpo.'],
  ['🪴', 'Reorganiza tus macetas o decoraciones para darles un toque fresco', 'Un pequeño cambio creativo en tu entorno despeja la monotonía.'],
  ['🎵', 'Pon música instrumental alegre de fondo mientras recoges tu espacio', 'Convierte el orden en una danza ligera de 5 minutos.'],
  ['🦶', 'Camina sobre tus talones 10 pasos y sobre tus puntas 10 pasos', 'Un juego de coordinación física que saca tu mente de las preocupaciones.'],
  ['🍵', 'Disfruta el aroma de tu café o té durante 30 segundos antes de beberlo', 'Los aromas cálidos envían una señal inmediata de pausa y confort.'],
  ['🧘', 'Inclina tu torso hacia adelante sentado y deja colgar los brazos', 'Suelta el peso de la cabeza y los brazos durante 30 segundos y sube despacio.'],
  ['📷', 'Captura la luz de la tarde entrando por algún rincón de tu casa', 'Aprecia la belleza tranquila de tu hogar cuando baja el ritmo del día.'],
  ['🚶‍♀️', 'Sal a dar 1000 pasos escuchando tus canciones favoritas', 'Menos de 10 minutos de caminata con música bastan para renovar tu ánimo.'],
  ['🥐', 'Consiéntete con tu pan o galleta favorita acompañada de té', 'Disfruta un momento cálido y delicioso sin prisas.'],
  ['🤸', 'Levanta ambos brazos como formando una "V" de victoria y respira hondo', 'Mantén esa postura abierta durante 20 segundos sintiendo cómo se expande tu pecho.'],
  ['🌿', 'Sal al patio o ventana a mirar las estrellas o la luna un momento', 'Cierra el día contemplando la calma de la noche y el aire fresco.'],
  ['🎨', 'Dibuja 5 cosas sencillas que te hicieron bien esta semana', 'Iconos o dibujos rápidos que te recuerden tus momentos de bienestar.'],
  ['🚿', 'Cambia tu toalla por una limpia y esponjosa para tu baño de hoy', 'Un detalle sencillo de cuidado que hace tu descanso mucho más agradable.'],
  ['🎧', 'Escucha el sonido de olas del mar mientras estiras tus piernas', 'Cierra los ojos 3 minutos e imagina la brisa marina llevando lejos el estrés.'],
  ['🥑', 'Prepara unas tostadas o snack saludable con aguacate y limón', 'Nutre tu cuerpo con algo fresco y delicioso hecho en 5 minutos.'],
  ['🚶‍♂️', 'Camina por un parque o plaza observando la tranquilidad del entorno', 'Permítete ir más despacio que los demás y disfrutar tu paseo.'],
  ['🧘‍♂️', 'Coloca tus manos en la nuca, abre los codos y mira hacia arriba', 'Un estiramiento excelente para quienes pasan tiempo frente a pantallas.'],
  ['📷', 'Fotografía tus pies descansando después de tu caminata del día', 'El símbolo perfecto de que hoy te moviste y ahora toca descansar.'],
  ['🎶', 'Baila suavemente mientras esperas a que esté lista tu comida o bebida', 'Aprovecha los minutos de espera en la cocina para mover la cadera y los hombros.'],
  ['🛋️', 'Acomoda tu lugar de descanso con tu manta más suave', 'Date un descanso reparador rodeado de comodidad.'],
  ['🍋', 'Exprime limones o naranjas a mano para hacer tu propia bebida', 'Siente la fuerza de tus manos y el aroma fresco de los cítricos.'],
  ['🤸‍♀️', 'Haz 5 giros amplios de cadera como si usaras un aro hula-hula', 'Un movimiento divertido que suelta la cintura y la espalda baja.'],
  ['🌳', 'Sal a respirar aire puro bajo el cielo abierto durante 10 minutos', 'Deja que la luz natural y el viento despejen cualquier cansancio mental.'],
  ['📓', 'Escribe "Hoy suelto la prisa" y regálate media hora libre', 'Pon por escrito tu permiso para descansar y disfrutar tu tiempo.'],
  ['🍵', 'Toma una bebida calientita en silencio disfrutando la paz de tu cuarto', 'Un cierre de jornada sereno y reconfortante para ti.'],
  ['🚶', 'Da una caminata corta sonriendo suavemente mientras avanzas', 'Relajar el rostro con una ligera sonrisa reduce la tensión muscular facial.'],
  ['✨', 'Deja listo un vaso de agua junto a tu cama y estira antes de dormir', 'Cuida tu descanso nocturno desde este momento.'],
  ['🌊', 'Respira hondo, suelta los hombros y celebra haberte regalado esta pausa', 'Cada vez que eliges tu paz sobre la prisa, fortaleces tu bienestar.'],
];

/**
 * 100 ACTIVIDADES INTERACTIVAS, CREATIVAS Y ALEGRES PARA AMOR PROPIO
 */
const AMOR_PROPIO_100: RawActivityTuple[] = [
  ['💙', 'Ponte tu outfit favorito hoy solo para darte gusto a ti', 'Elige la ropa con la que te sientes más cómodo y seguro, mírate al espejo con orgullo y tómate una foto o captura tu look.'],
  ['🍽️', 'Sírvete tu comida favorita como en restaurante de lujo', 'Usa tu plato y vaso más bonitos, decora tu comida con esmero y disfruta ser tu propio invitado especial.'],
  ['🎧', 'Baila frente al espejo tu canción de empoderamiento favorita', 'Pon esa canción que te hace sentir invencible, muévete con actitud y celebra quién eres.'],
  ['✍️', 'Escribe 5 cualidades tuyas que te hacen una gran persona', 'En una hoja bonita, reconoce tus fortalezas, tu empatía y tus talentos con tu propia letra y tómale foto.'],
  ['🚶', 'Sal a una "cita contigo mismo" a caminar por tu lugar favorito', 'Dedícate 20 minutos de paseo exclusivo para ti, disfrutando tu propia compañía y fotografiando el paisaje.'],
  ['☕', 'Prepárate una bebida digna de cafetería artesanal en casa', 'Dedícate el tiempo de espumar la leche, decorar con canela o hielo y consentirte hoy.'],
  ['🌱', 'Regálate una planta o flor para decorar tu espacio personal', 'Elige una planta bonita que represente tu crecimiento y colócala donde la veas todos los días.'],
  ['🧖', 'Sesión de cuidado facial o hidratación de manos y rostro', 'Lávate la cara con calma, ponte crema hidratante o una mascarilla fresca y consiente tu piel.'],
  ['🎨', 'Dedica 20 minutos a ese hobby o talento que tanto disfrutas', 'Dibujar, cocinar, tocar música, armar algo o escribir: dale espacio hoy a lo que te apasiona.'],
  ['🛏️', 'Transforma tu habitación en un hotel boutique para ti', 'Tiende tu cama impecable, acomoda los cojines, ventila y disfruta entrar a un cuarto hermoso.'],
  ['👟', 'Sal a caminar o trotar celebrando todo lo que tu cuerpo puede hacer', 'Agradece a tus piernas por llevarte a tantos lugares mientras das un paseo activo de 15 minutos.'],
  ['🧁', 'Prepárate el postre o antojo saludable que más te guste', 'Disfruta preparar algo dulce y rico para ti con ingredientes que te hagan bien.'],
  ['📷', 'Toma una foto de algo que hayas creado o logrado recientemente', 'Un dibujo, un proyecto, una receta o tu espacio ordenado: presume con orgullo tu trabajo.'],
  ['🧘', '5 minutos de postura de poder y estiramiento frente al espejo', 'Ponte de pie con la espalda erguida, hombros atrás y respira profundo sintiendo tu presencia.'],
  ['📚', 'Regálate 15 minutos de lectura sobre un tema que te apasione', 'Nutre tu curiosidad aprendiendo o leyendo algo que te inspire crecer.'],
  ['🎵', 'Crea tu playlist oficial "Me siento increíble"', 'Reúne las canciones que más elevan tu autoestima y escúchalas mientras te mueves.'],
  ['🌅', 'Sal a ver el amanecer o atardecer agradeciéndote por no rendirte', 'Dedícate unas palabras de reconocimiento mientras contemplas los colores del cielo.'],
  ['🥗', 'Prepara un platillo lleno de colores que nutra tu cuerpo con cariño', 'Cocinar rico y nutritivo para ti mismo es una de las mayores muestras de amor propio.'],
  ['💌', 'Escríbete una carta breve de apoyo como si fueras tu mejor amigo', 'Háblate con la misma ternura, paciencia y admiración con la que animas a quienes quieres.'],
  ['🚲', 'Sal a pasear al aire libre disfrutando el viento y tu libertad', 'Camina o rueda por un parque sintiendo la alegría de dedicarte tiempo de calidad.'],
  ['🕯️', 'Crea una tarde de spa casero con música suave y bebida rica', 'Baja el ritmo, pon un aroma delicioso en tu cuarto y consiéntete como mereces.'],
  ['👕', 'Ordena tu clóset dejando al frente las prendas que te hacen sentir genial', 'Despeja tu armario para que cada mañana veas primero la ropa que más te favorece.'],
  ['🍓', 'Prepara un tazón de frutas decorado con semillas, miel o yogur', 'Haz que tu merienda se vea tan bonita como deliciosa y tómale una gran foto.'],
  ['🤸', 'Estira todo tu cuerpo con suavidad agradeciendo tu salud', 'Mueve cuello, brazos, cintura y piernas con cariño y sin forzar, escuchando a tu cuerpo.'],
  ['📓', 'Haz una lista de 5 metas o sueños que te ilusionan cumplir', 'Visualiza hacia dónde quieres ir y celebra el entusiasmo de construir tu camino.'],
  ['🌳', 'Ve a tu parque o rincón favorito y tómate un descanso en una banca', 'Disfruta observar los árboles y el entorno sabiendo que este momento es 100% tuyo.'],
  ['🎸', 'Aprende algo nuevo durante 15 minutos (una palabra, acorde o receta)', 'Demuéstrate a ti mismo lo capaz que eres de seguir aprendiendo cosas interesantes.'],
  ['🥤', 'Prepara tu bebida refrescante favorita con hielo y rodajas de fruta', 'Brinda por ti, por tu esfuerzo de esta semana y por todo lo que estás superando.'],
  ['🖼️', 'Enmarca o coloca en tu pared una frase o foto que te haga sonreír', 'Rodéate de recordatorios visuales que eleven tu ánimo cada vez que los mires.'],
  ['🚶‍♀️', 'Camina con la mirada en alto y paso seguro durante 10 minutos', 'Nota cómo cambia tu estado de ánimo cuando caminas erguido y mirando el horizonte.'],
  ['🥞', 'Desayuno de campeón hecho por ti con tus ingredientes preferidos', 'Empieza el día demostrándote cuánto te importas con un gran desayuno.'],
  ['🖌️', 'Diseña tu propio escudo o símbolo personal en una hoja', 'Dibuja los elementos, valores y gustos que te representan como persona única.'],
  ['🐾', 'Comparte un momento de cariño y juego con tu mascota', 'Recibe y da afecto incondicional jugando un rato al aire libre o en casa.'],
  ['🚿', 'Arréglate hoy con calma: peinado, perfume o crema que te encante', 'Huele rico y arréglate para ti mismo, aunque hoy te quedes en casa o salgas poco.'],
  ['📷', 'Fotografía 3 cosas de tu habitación que reflejen tu personalidad', 'Tu libro, tu taza, tu planta o tu instrumento: celebra tu estilo único.'],
  ['🧘‍♀️', 'Pon ambas manos sobre tu corazón y respira profundo 10 veces', 'Siente los latidos de tu corazón y recuérdate: "Estoy aquí para cuidarme y apoyarme".'],
  ['🌮', 'Cocina ese platillo que te queda buenísimo y disfrútalo', 'Reconoce tu sazón y tu habilidad preparando algo delicioso en tu cocina.'],
  ['🎶', 'Canta tu canción favorita con toda la emoción y sin pena', 'Disfruta el timbre de tu voz y la alegría de cantar libremente.'],
  ['🪴', 'Limpia y embellece tu escritorio o mesa de noche', 'Regálate un espacio ordenado, limpio y digno de ti.'],
  ['👟', 'Haz 10 minutos de actividad física que te divierta de verdad', 'Bailar, saltar la cuerda, caminar rápido o estirar: mueve tu cuerpo por placer.'],
  ['🍊', 'Prepara un snack fresco de media tarde para recargar tu energía', 'Escucha cuando tu cuerpo pide descanso y alimento, y respóndele con cariño.'],
  ['📖', 'Subraya o copia una frase de un libro que haya tocado tu corazón', 'Guarda esas palabras sabias que te inspiran a ser fiel a ti mismo.'],
  ['🌇', 'Sal a caminar al atardecer y celebra un logro de tu día', 'Por pequeño que haya sido tu avance hoy, reconócelo mientras miras el cielo.'],
  ['🥣', 'Prepara una receta nueva que tenías guardada para intentar', 'Atrévete a experimentar en la cocina y diviértete con el resultado.'],
  ['🤸‍♂️', 'Abre los brazos de par en par frente a la ventana y respira', 'Ocupa tu espacio con confianza y llena tus pulmones de aire nuevo.'],
  ['🎨', 'Escribe tu nombre con letras creativas y decóralo con colores', 'Celebra tu identidad haciendo una pequeña obra de arte con tu nombre.'],
  ['🍵', 'Toma una taza de té o café caliente disfrutando 10 minutos de paz', 'Regálate silencio, calma y calidez sin exigirte nada más en este instante.'],
  ['🚶‍♂️', 'Da un paseo por un lugar bonito que te inspire tranquilidad', 'Lleva tus pasos hacia entornos que te hagan sentir bien y en armonía.'],
  ['🛋️', 'Prepara tu cama temprano para que esta noche te reciba como rey', 'Cuidar a tu "yo del futuro" dejando tu cama lista es puro amor propio.'],
  ['📷', 'Toma una foto de tu sonrisa o de algo que te hizo sonreír hoy', 'Guarda la evidencia de que en tu día siempre hay espacio para la alegría.'],
  ['🥑', 'Prepara una cena nutritiva y deliciosa en lugar de saltarte comidas', 'Cuida tu energía cerrando el día con alimentos que te hagan sentir ligero y bien.'],
  ['🎧', 'Camina 15 minutos escuchando un podcast o charla que te motive', 'Alimenta tu mente con ideas positivas mientras pones tu cuerpo en movimiento.'],
  ['🌻', 'Compra o corta una flor bonita para ponerla junto a tu lugar de estudio o descanso', 'Porque tú también mereces regalarte flores en cualquier día de la semana.'],
  ['🧘', 'Haz 5 minutos de estiramientos suaves antes de acostarte', 'Despide el día soltando la tensión del cuerpo con movimientos llenos de cuidado.'],
  ['🧁', 'Comparte o disfruta tu postre favorito sin prisas', 'Saborea cada bocado con atención plena y disfrute total.'],
  ['📝', 'Escribe 3 cosas que le agradeces a tu cuerpo y a tu mente hoy', 'Valora tu capacidad de sentir, pensar, moverte y salir adelante cada día.'],
  ['🕺', 'Baila mientras te arreglas o recoges tu habitación', 'Ponle ritmo y alegría a tu rutina diaria con tus canciones preferidas.'],
  ['💧', 'Prepara tu botella o termo favorito con agua fresca para todo el día', 'Mantenerte hidratado es un gesto constante de cuidado hacia ti.'],
  ['🌳', 'Sal a caminar y observa cómo cada árbol crece a su propia manera', 'Recuerda que la naturaleza no compite: cada proceso y cada ritmo es único.'],
  ['🎲', 'Regálate media hora para jugar o hacer algo que te encantaba de niño', 'Conecta con tu niño interior dibujando, armando algo o jugando sin preocupaciones.'],
  ['🥪', 'Prepara un almuerzo delicioso con tus ingredientes favoritos', 'Dedícale cariño a tu comida de hoy y preséntala bonito en el plato.'],
  ['🌬️', 'Inhala confianza y exhala cualquier duda o autocrítica 5 veces', 'Usa tu respiración para tratarte con amabilidad y respeto en este momento.'],
  ['📷', 'Fotografía el rincón de tu casa que más te gusta cómo quedó', 'Reconoce el hogar y el ambiente cálido que has ido creando para ti.'],
  ['🚶‍♀️', 'Sal a dar una caminata ligera disfrutando el sol de la mañana o tarde', 'Vitamina D, movimiento suave y aire fresco para consentir tu bienestar.'],
  ['🎵', 'Dedícate a ti mismo una canción bonita y escúchala completa', 'Presta atención a la letra y recíbela como un abrazo musical para ti.'],
  ['🪴', 'Cuida tus plantas recordando que tú también floreces con paciencia', 'Riega tus macetas y observa cuánto han crecido con tus cuidados.'],
  ['🤸‍♀️', 'Haz círculos suaves con los hombros y regálate un abrazo', 'Cruza tus brazos sobre el pecho, date unas palmaditas suaves y sonríe.'],
  ['🍍', 'Prepara un plato de fruta fresca cortada con esmero', 'Disfruta la dulzura natural y los colores vibrantes en tu mesa.'],
  ['📓', 'Anota un reto difícil del pasado que ya lograste superar', 'Recuerda tu propia fuerza y todo lo que has aprendido en tu camino.'],
  ['🚿', 'Date un baño sin prisas usando tu jabón o shampoo de aroma favorito', 'Convierte tu ducha diaria en un momento de renovación y apapacho personal.'],
  ['🌅', 'Mira el cielo al atardecer y promete hablarte con cariño hoy', 'Un compromiso sencillo pero poderoso contigo mismo bajo el cielo de la tarde.'],
  ['🍝', 'Cocina tu receta favorita desde cero disfrutando cada paso', 'Pon música agradable, prepara tus ingredientes y disfruta cocinar para ti.'],
  ['👟', 'Limpia tu calzado favorito y sal a caminar con paso firme', 'Siéntete renovado de pies a cabeza durante tu caminata del día.'],
  ['🧘‍♂️', 'Siéntate cómodo, cierra los ojos 2 minutos y respira en calma', 'Regálate una pausa de paz interior en medio de tus actividades.'],
  ['🎨', 'Personaliza un objeto tuyo (libreta, taza, funda) con un toque creativo', 'Haz que tus objetos cotidianos reflejen tus gustos y tu alegría.'],
  ['🍵', 'Prepara una bebida calientita y disfrútala leyendo algo inspirador', 'Un momento acogedor de película creado por ti y para ti.'],
  ['📷', 'Captura en foto un detalle bonito que te encontraste hoy al caminar', 'Entrena tu mirada para encontrar belleza en tu recorrido diario.'],
  ['🚶', 'Da 15 minutos de caminata celebrando tu constancia en estas actividades', 'Cada paso que das aquí demuestra cuánto te importa estar bien.'],
  ['🧀', 'Ármate una merienda especial para ver tu serie o película favorita', 'Consiéntete con una función privada y tus bocadillos preferidos.'],
  ['🌿', 'Abre tu ventana, respira aire fresco y estira los brazos hacia arriba', 'Despierta tu vitalidad y saluda al día con buena energía.'],
  ['💌', 'Dite frente al espejo una frase de ánimo antes de salir o continuar tu día', 'Tu voz es la más importante que escucharás hoy: asegúrate de que sea amable.'],
  ['🎵', 'Baila una canción alegre de principio a fin sin parar', 'Siente cómo sube tu temperatura, tu energía y tu buen humor.'],
  ['🛏️', 'Pon sábanas limpias o perfuma tu almohada para dormir delicioso', 'Regálate el mejor descanso posible esta noche.'],
  ['🍉', 'Prepara un agua fresca o smoothie natural lleno de sabor', 'Refresca tu día con algo rico hecho en tu propia cocina.'],
  ['🤸', 'Haz 10 estiramientos laterales de cintura levantando un brazo', 'Alarga cada costado de tu cuerpo y respira con amplitud.'],
  ['📚', 'Dedica un rato a organizar tus proyectos o ideas que te entusiasman', 'Dale forma a tus planes con ilusión y a tu propio ritmo.'],
  ['🌳', 'Pasea por un lugar con árboles y disfruta la sombra fresca', 'Conecta con la tranquilidad de la naturaleza mientras caminas.'],
  ['🧁', 'Prepara hotcakes, pan francés o fruta asada con canela', 'Un aroma delicioso en tu cocina para consentir tus sentidos.'],
  ['📷', 'Toma una foto de tu actividad favorita del día de hoy', 'Guarda este recuerdo en tu colección personal de avances.'],
  ['🧘', 'Respira profundo 5 veces soltando cualquier comparación con los demás', 'Tu camino, tus tiempos y tu proceso son únicos y valiosos.'],
  ['🚶‍♀️', 'Camina 10 minutos disfrutando el movimiento libre de tu cuerpo', 'Siente la ligereza de caminar sin prisa y con atención plena.'],
  ['🎧', 'Escucha música que te inspire creatividad mientras ordenas tu espacio', 'Deja que las buenas melodías acompañen tus manos en movimiento.'],
  ['🌱', 'Observa un brote nuevo en una planta o jardín cercano', 'Recuerda que cada día trae nuevas oportunidades para crecer y renovarte.'],
  ['🥤', 'Sirve tu bebida favorita con hielo en tu vaso preferido', 'Haz que hasta el gesto más sencillo del día se sienta especial.'],
  ['🤸‍♂️', 'Levanta los brazos, estira la espalda y suelta una sonrisa amplia', 'Activa la química del bienestar en tu cuerpo con este gesto físico.'],
  ['📓', 'Escribe qué es lo que más te enorgullece de ti en esta etapa', 'Honra tu esfuerzo, tu sensibilidad y tus ganas de salir adelante.'],
  ['🌇', 'Contempla las luces del atardecer desde tu ventana o parque', 'Agradece un día más de aprendizajes y momentos dedicados a ti.'],
  ['🍵', 'Disfruta una infusión tibia antes de descansar', 'Un abrazo cálido en taza para cerrar tu jornada con serenidad.'],
  ['✨', 'Acomoda tu espacio para que mañana despiertes en un lugar armonioso', 'Un regalo de orden y paz para tu mañana siguiente.'],
  ['💙', 'Celebra todo tu camino: abrázate fuerte y reconoce lo valioso que eres', 'Has dedicado tiempo real a cuidarte y quererte; sigue brillando siempre a tu ritmo.'],
];

const buildCategoryTasks = (
  prefix: string,
  category: EmotionalFocusCategory,
  tuples: RawActivityTuple[]
): StreakTaskItem[] =>
  tuples.map(([emoji, title, description], idx) => ({
    id: `${prefix}_${idx + 1}`,
    category,
    emoji,
    title,
    description,
  }));

/**
 * 400 ACTIVIDADES INTERACTIVAS (100 POR CADA UNA DE LAS 4 CATEGORÍAS PRINCIPALES)
 */
export const ALL_STREAK_TASKS: StreakTaskItem[] = [
  ...buildCategoryTasks('dep', 'depresion', DEPRESION_100),
  ...buildCategoryTasks('ans', 'ansiedad', ANSIEDAD_100),
  ...buildCategoryTasks('est', 'estres', ESTRES_100),
  ...buildCategoryTasks('amo', 'amor_propio', AMOR_PROPIO_100),
];

/**
 * 100 FRASES BONITAS Y DE APOYO DE ANIMA
 */
export const STREAK_MOTIVATIONAL_QUOTES: string[] = [
  '1. No tienes que poder con todo hoy; dar un paso a tu ritmo ya es valioso.',
  '2. Si hoy fue un día pesado, respira: aquí avanzamos sin prisas ni presiones.',
  '3. Avanzar no es una línea recta; cada actividad que realizas suma a tu bienestar.',
  '4. Está bien ir a tu propio ritmo, lo importante es acompañarte con cariño.',
  '5. Tu valor no se mide por la velocidad, sino por el amor con el que te cuidas.',
  '6. Hoy hiciste algo bueno por ti con la energía que tenías, y eso cuenta mucho.',
  '7. Los cambios más sinceros se construyen paso a paso; ten paciencia contigo.',
  '8. Aunque hoy el día parezca nublado, tu capacidad de sentirte mejor sigue viva.',
  '9. Date permiso de descansar y retomar tus actividades cuando sientas que lo necesitas.',
  '10. Cada pequeña acción que realizas por tu paz interior transforma tu día.',
  '11. Vamos un momento a la vez, eligiendo actividades que te hagan sentir bien.',
  '12. Mereces la misma paciencia y ternura que siempre le brindas a los demás.',
  '13. Un día difícil no borra todo el camino valiente que ya has recorrido.',
  '14. Qué alegría verte dedicar unos minutos hoy a ti y a tu bienestar.',
  '15. Tú decides tu ritmo y tu momento; yo estoy aquí para acompañarte siempre.',
];

export const getRandomStreakMotivationalQuote = (): string => {
  const raw =
    STREAK_MOTIVATIONAL_QUOTES[
      Math.floor(Math.random() * STREAK_MOTIVATIONAL_QUOTES.length)
    ] || STREAK_MOTIVATIONAL_QUOTES[0];
  return raw.replace(/^\d+\.\s*/, '');
};

export const getTasksForTopic = (
  category?: EmotionalFocusCategory
): StreakTaskItem[] => {
  const normalized = normalizeTopicCategory(category);
  const filtered = ALL_STREAK_TASKS.filter((t) => t.category === normalized);
  return filtered.length > 0 ? filtered : ALL_STREAK_TASKS;
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
  const pool = getTasksForTopic(task.category);
  return pool[(dayNumber - 1) % pool.length];
};

export const generateSevenDayTasksForUser = (
  category?: EmotionalFocusCategory,
  userId?: string,
  count = 12
): StreakDayProgress[] => {
  const pool = getTasksForTopic(category);
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

  const selectedTasks = shuffle(pool).slice(0, count);

  return selectedTasks.map((task, idx) => ({
    dayNumber: idx + 1,
    dayName: `Actividad ${idx + 1}`,
    task,
    status: idx === 0 ? 'unlocked' : 'locked',
    postponedCount: 0,
  }));
};
