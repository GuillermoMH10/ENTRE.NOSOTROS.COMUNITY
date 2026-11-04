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
    levelLabel: 'NIVEL 1 • INICIO',
    name: 'Semilla de Valentía',
    subtitle: 'El valor de dar el primer paso',
    description:
      'Desbloqueada al completar tu primera racha de 7 días cuidando tus emociones paso a paso.',
    emoji: '🌱',
    icon: 'leaf',
    color: '#10B981',
    softBg: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  {
    id: 'badge_llama_resiliencia',
    level: 2,
    levelLabel: 'NIVEL 2 • CONSTANCIA',
    name: 'Llama de Resiliencia',
    subtitle: 'Tu luz sigue encendida aún en días grises',
    description:
      'Reconoce tu constancia para levantarte, intentarlo de nuevo y transformar tus días con acciones reales.',
    emoji: '🔥',
    icon: 'flame',
    color: '#FF7A00',
    softBg: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  {
    id: 'badge_faro_calma',
    level: 3,
    levelLabel: 'NIVEL 3 • ARMONÍA',
    name: 'Faro de Calma',
    subtitle: 'Claridad y paz en medio de la tormenta',
    description:
      'Otorgada a quienes han aprendido a escuchar su mente, pausar con amor propio y cultivar serenidad diaria.',
    emoji: '🌤️',
    icon: 'sunny',
    color: '#0EA5E9',
    softBg: '#F0F9FF',
    borderColor: '#7DD3FC',
  },
  {
    id: 'badge_corazon_inquebrantable',
    level: 4,
    levelLabel: 'NIVEL 4 • MAESTRÍA',
    name: 'Corazón Inquebrantable',
    subtitle: 'Inspiración viva para toda la comunidad',
    description:
      'El máximo reconocimiento de Entre Nosotros: eres ejemplo de superación, empatía y fortaleza emocional.',
    emoji: '👑',
    icon: 'trophy',
    color: '#8B5CF6',
    softBg: '#F5F3FF',
    borderColor: '#C4B5FD',
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
    title: 'Transformando la Tristeza en Luz',
    shortProblemLabel: 'superando la tristeza y el desánimo',
    subtitle: 'Pequeños pasos diarios para reconectar con la calidez y la alegría cotidiana.',
    emoji: '🌧️',
    color: '#3B82F6',
    softBg: '#EFF6FF',
    animaPrompt:
      'Noté en tus respuestas que últimamente cargas con tristeza o desánimo 💙. No tienes que cambiarlo todo de golpe: ¿me permites acompañarte durante 7 días con pequeñas acciones sencillas para recuperar tu sonrisa paso a paso?',
    postTagText: 'Superando la tristeza paso a paso 💙',
  },
  ansiedad: {
    title: 'Recuperando mi Calma Interior',
    shortProblemLabel: 'superando la ansiedad y el sobrepensamiento',
    subtitle: 'Retos suaves para bajar el ruido mental y volver al momento presente.',
    emoji: '🌿',
    color: '#0D9488',
    softBg: '#F0FDFA',
    animaPrompt:
      'Sé que tu mente ha estado acelerada y pensando en mil cosas a la vez 🌱. ¿Te gustaría iniciar conmigo una Racha de 7 Días con ejercicios sencillos para devolverle la paz a tu corazón?',
    postTagText: 'Recuperando mi calma interior 🌿',
  },
  enojo: {
    title: 'Liberando Tensión y Enojo',
    shortProblemLabel: 'transformando el enojo y la frustración en paz',
    subtitle: 'Actividades liberadoras para soltar la frustración y recuperar tu ligereza.',
    emoji: '⚡',
    color: '#F97316',
    softBg: '#FFF7ED',
    animaPrompt:
      'Es válido sentir frustración o enojo cuando las cosas pesan demasiado 🔥. ¿Qué dices si durante 7 días canalizamos esa energía juntos con retos diarios simples que te hagan sentir más libre y en paz?',
    postTagText: 'Soltando la tensión y eligiendo mi paz 🔥',
  },
  inseguridad: {
    title: 'Fortaleciendo mi Amor Propio',
    shortProblemLabel: 'venciendo la inseguridad y fortaleciendo mi autoestima',
    subtitle: '7 días para hablarte con cariño, reconocer tu valor y confiar más en ti.',
    emoji: '✨',
    color: '#8B5CF6',
    softBg: '#F5F3FF',
    animaPrompt:
      'A veces somos demasiado duros con nosotros mismos y olvidamos todo lo que valemos ✨. ¿Te animas a empezar una Racha de 7 Días conmigo para fortalecer tu confianza y amor propio?',
    postTagText: 'Fortaleciendo mi autoestima y confianza ✨',
  },
  estres: {
    title: 'Pausa y Recarga de Energía',
    shortProblemLabel: 'superando el estrés y el agotamiento diario',
    subtitle: 'Micro-hábitos diarios para descansar de verdad y soltar la sobrecarga.',
    emoji: '🔋',
    color: '#10B981',
    softBg: '#ECFDF5',
    animaPrompt:
      'Has estado llevando demasiada carga sobre tus hombros y tu cuerpo pide un respiro 🍃. ¿Iniciamos juntos una Racha de 7 Días con pequeñas pausas para recargar tu energía?',
    postTagText: 'Recargando mi energía y soltando el estrés 🔋',
  },
  felicidad: {
    title: 'Multiplicando mi Bienestar y Gratitud',
    shortProblemLabel: 'cultivando gratitud y bienestar emocional',
    subtitle: '7 días para celebrar la vida, mantener tus buenos hábitos y contagiar luz.',
    emoji: '☀️',
    color: '#F59E0B',
    softBg: '#FFFBEB',
    animaPrompt:
      '¡Me alegra muchísimo ver que estás en una etapa de equilibrio! ☀️ ¿Te gustaría iniciar una Racha de 7 Días para multiplicar tu bienestar e inspirar a toda la comunidad Entre Nosotros?',
    postTagText: 'Cultivando gratitud y alegría diaria ☀️',
  },
};

/**
 * 108 TAREAS DIARIAS SENCILLAS, REALES Y VARIADAS (18 por cada una de las 6 categorías)
 */
export const ALL_STREAK_TASKS: StreakTaskItem[] = [
  // ==================== 1. TRISTEZA (18 tareas) ====================
  {
    id: 'tri_1',
    category: 'tristeza',
    emoji: '🎧',
    title: 'Caminata con tu música favorita',
    description: 'Sal a caminar 10 minutos hoy mientras escuchas esa canción que siempre te levanta el ánimo. Toma una foto de tu camino o de tus audífonos.',
  },
  {
    id: 'tri_2',
    category: 'tristeza',
    emoji: '☀️',
    title: 'Un rayito de sol en tu día',
    description: 'Sal a la ventana, patio o calle durante 5 minutos para recibir luz natural en el rostro y respirar profundo. Comparte una foto del cielo de hoy.',
  },
  {
    id: 'tri_3',
    category: 'tristeza',
    emoji: '☕',
    title: 'Tu bebida reconfortante',
    description: 'Prepárate un té, café, chocolate o agua fresca favorita y disfrútalo sin prisas. Toma una foto de tu taza o vaso favorito.',
  },
  {
    id: 'tri_4',
    category: 'tristeza',
    emoji: '🛏️',
    title: 'Rincón de paz limpio',
    description: 'Tiende tu cama o acomoda una pequeña esquina de tu cuarto para que tu espacio te abrace hoy. Sube foto de tu rincón ordenado.',
  },
  {
    id: 'tri_5',
    category: 'tristeza',
    emoji: '🌿',
    title: 'Conecta con algo vivo',
    description: 'Riega una planta, acaricia a tu mascota o contempla un árbol cercano por unos minutos. Toma una foto de ese ser vivo.',
  },
  {
    id: 'tri_6',
    category: 'tristeza',
    emoji: '📝',
    title: 'Nota amable para mí',
    description: 'Escribe en una hojita de papel: "Hoy doy un paso a mi propio ritmo y está bien". Tómale foto a tu nota escrita a mano.',
  },
  {
    id: 'tri_7',
    category: 'tristeza',
    emoji: '🚿',
    title: 'Ducha o lavado renovador',
    description: 'Date un baño tibio o lávate la cara con calma imaginando que el agua se lleva el cansancio. Comparte una foto de algo que te haga sentir fresco/a.',
  },
  {
    id: 'tri_8',
    category: 'tristeza',
    emoji: '🍎',
    title: 'Nutre tu cuerpo con cariño',
    description: 'Come una fruta, postre o platillo que te guste mucho saboreando cada bocado. Toma foto de lo que elegiste comer hoy.',
  },
  {
    id: 'tri_9',
    category: 'tristeza',
    emoji: '🎬',
    title: 'Momento de risa o confort',
    description: 'Mira un episodio corto, video gracioso o fragmento de tu película favorita que te haga sonreír. Comparte foto de tu pantalla o momento.',
  },
  {
    id: 'tri_10',
    category: 'tristeza',
    emoji: '🌅',
    title: 'Caza un color bonito hoy',
    description: 'Busca a tu alrededor un objeto, flor o paisaje de tu color favorito y captúralo en una foto para compartirlo.',
  },
  {
    id: 'tri_11',
    category: 'tristeza',
    emoji: '💌',
    title: 'Un saludo a alguien especial',
    description: 'Envía un mensaje corto o un sticker bonito a un amigo o familiar que aprecies. Sube una foto simbólica de tu momento.',
  },
  {
    id: 'tri_12',
    category: 'tristeza',
    emoji: '📖',
    title: 'Tres páginas de calma',
    description: 'Lee al menos 2 o 3 páginas de un libro, cómic o lectura inspiradora hoy. Tómale foto a la página que leíste.',
  },
  {
    id: 'tri_13',
    category: 'tristeza',
    emoji: '🧦',
    title: 'Comodidad ante todo',
    description: 'Ponte tu prenda, suéter o calcetines más cómodos y regálate 10 minutos de descanso sin culpa. Toma foto de tu momento acogedor.',
  },
  {
    id: 'tri_14',
    category: 'tristeza',
    emoji: '🎨',
    title: 'Garabato libre',
    description: 'Dibuja en una hoja cualquier figura, estrella, flor o garabato sin juzgar cómo quede. Comparte la foto de tu dibujo.',
  },
  {
    id: 'tri_15',
    category: 'tristeza',
    emoji: '🕯️',
    title: 'Ambiente cálido',
    description: 'Enciende una lámpara cálida, vela aromática o abre las cortinas para iluminar tu habitación. Toma foto de la luz de tu espacio.',
  },
  {
    id: 'tri_16',
    category: 'tristeza',
    emoji: '💧',
    title: 'Hidratación consciente',
    description: 'Sirve un vaso grande de agua fresca y bébelo despacio agradeciendo a tu cuerpo por sostenerte hoy. Sube foto de tu vaso.',
  },
  {
    id: 'tri_17',
    category: 'tristeza',
    emoji: '🌇',
    title: 'Mirar el atardecer',
    description: 'Detente 3 minutos al final de la tarde para observar cómo cambia el color del cielo. Captura ese instante en una foto.',
  },
  {
    id: 'tri_18',
    category: 'tristeza',
    emoji: '🧸',
    title: 'Tu objeto de valor emocional',
    description: 'Busca un recuerdo, regalo, peluche o fotografía que te traiga un buen recuerdo y tómale una foto celebrando que sigue contigo.',
  },

  // ==================== 2. ANSIEDAD (18 tareas) ====================
  {
    id: 'ans_1',
    category: 'ansiedad',
    emoji: '🌬️',
    title: 'Respiración 4-4-4 frente al cielo',
    description: 'Inhala en 4 segundos, sostén 4 y exhala en 4 durante 3 minutos mirando por la ventana o al aire libre. Toma foto de tu vista.',
  },
  {
    id: 'ans_2',
    category: 'ansiedad',
    emoji: '👀',
    title: 'Anclaje 5-4-3-2-1',
    description: 'Observa 5 cosas a tu alrededor que te transmitan calma en este preciso instante y tómale foto a la que más te guste.',
  },
  {
    id: 'ans_3',
    category: 'ansiedad',
    emoji: '📵',
    title: '15 minutos lejos del ruido',
    description: 'Deja las redes sociales por 15 minutos y haz algo con tus manos (ordenar, cocinar, dibujar). Toma foto de lo que hiciste.',
  },
  {
    id: 'ans_4',
    category: 'ansiedad',
    emoji: '🍵',
    title: 'Infusión o bebida sin cafeína',
    description: 'Toma una bebida relajante sintiendo la temperatura en tus manos. Sube una foto de tu momento de calma.',
  },
  {
    id: 'ans_5',
    category: 'ansiedad',
    emoji: '📓',
    title: 'Vaciar la mente en papel',
    description: 'Escribe en una hoja las preocupaciones que traes en la cabeza para sacarlas de tu mente. Toma foto de tu libreta cerrada como símbolo de soltar.',
  },
  {
    id: 'ans_6',
    category: 'ansiedad',
    emoji: '🦶',
    title: 'Pies en la tierra',
    description: 'Camina descalzo/a sobre el piso fresco o el pasto por 3 minutos sintiendo el soporte bajo tus pies. Toma foto hacia tus pies o el suelo.',
  },
  {
    id: 'ans_7',
    category: 'ansiedad',
    emoji: '🎶',
    title: 'Sonidos que abrazan',
    description: 'Escucha durante 10 minutos música instrumental, lluvia o sonidos de naturaleza. Comparte foto de tu rincón de descanso.',
  },
  {
    id: 'ans_8',
    category: 'ansiedad',
    emoji: '🤲',
    title: 'Estiramiento suave de cuello y hombros',
    description: 'Gira suavemente tus hombros hacia atrás y estira tu cuello durante 3 minutos para soltar la tensión. Toma foto de tu espacio tras estirar.',
  },
  {
    id: 'ans_9',
    category: 'ansiedad',
    emoji: '🌿',
    title: 'Aroma que tranquiliza',
    description: 'Huele algo agradable hoy: café recién hecho, una fruta, crema, jabón o una flor. Tómale foto a eso que huele tan bien.',
  },
  {
    id: 'ans_10',
    category: 'ansiedad',
    emoji: '✅',
    title: 'Una sola cosa a la vez',
    description: 'Elige una tarea pequeñita que habías pospuesto (doblar ropa, lavar un plato) y haz solo esa. Sube foto de tu logro.',
  },
  {
    id: 'ans_11',
    category: 'ansiedad',
    emoji: '🧊',
    title: 'Agua fresca para reiniciar',
    description: 'Moja tus muñecas y rostro con agua fresca para bajar la aceleración física. Toma foto de algún detalle fresco de tu día.',
  },
  {
    id: 'ans_12',
    category: 'ansiedad',
    emoji: '☁️',
    title: 'Observador de nubes',
    description: 'Mira hacia arriba por 3 minutos y observa cómo las nubes pasan sin prisa, igual que los pensamientos. Toma foto del cielo.',
  },
  {
    id: 'ans_13',
    category: 'ansiedad',
    emoji: '🕯️',
    title: 'Bajar las luces antes de dormir',
    description: 'Prepara tu habitación con luz tenue para indicarle a tu cerebro que ya está a salvo. Sube foto de tu ambiente tranquilo.',
  },
  {
    id: 'ans_14',
    category: 'ansiedad',
    emoji: '🧩',
    title: 'Enfoque en un detalle bonito',
    description: 'Toma una foto de cerca a la textura de una hoja, una tela o una taza, enfocando tu mente en los pequeños detalles.',
  },
  {
    id: 'ans_15',
    category: 'ansiedad',
    emoji: '🚶',
    title: 'Paseo sin prisa',
    description: 'Camina 10 minutos a un ritmo más lento del habitual, observando las casas, árboles o calles. Sube foto de tu paseo.',
  },
  {
    id: 'ans_16',
    category: 'ansiedad',
    emoji: '💌',
    title: 'Recordatorio de seguridad',
    description: 'Escribe en un post-it: "En este momento estoy a salvo, no tengo que resolver todo hoy" y pégalo cerca. Sube su foto.',
  },
  {
    id: 'ans_17',
    category: 'ansiedad',
    emoji: '🥣',
    title: 'Comer sin pantallas',
    description: 'Disfruta una comida o snack hoy sin mirar el celular ni la televisión. Toma foto de tu plato antes de empezar.',
  },
  {
    id: 'ans_18',
    category: 'ansiedad',
    emoji: '🌙',
    title: 'Cierre del día en calma',
    description: 'Agradece una cosa sencilla que salió bien hoy antes de descansar. Comparte una foto que represente tu paz de hoy.',
  },

  // ==================== 3. ENOJO E IRRITABILIDAD (18 tareas) ====================
  {
    id: 'eno_1',
    category: 'enojo',
    emoji: '👟',
    title: 'Caminata rápida liberadora',
    description: 'Sal a caminar a paso firme o haz 10 minutos de movimiento físico para liberar la adrenalina acumulada. Toma foto al terminar.',
  },
  {
    id: 'eno_2',
    category: 'enojo',
    emoji: '📄',
    title: 'Escribir y soltar',
    description: 'Escribe en un papel todo lo que te molestó, rómpelo en pedacitos y tíralo como símbolo de liberación. Toma foto de una hoja limpia nueva.',
  },
  {
    id: 'eno_3',
    category: 'enojo',
    emoji: '🎸',
    title: 'Tu canción para descargar energía',
    description: 'Pon a buen volumen una canción con mucha energía y cántala o muévete con ella. Sube captura o foto de tu momento musical.',
  },
  {
    id: 'eno_4',
    category: 'enojo',
    emoji: '🧊',
    title: 'Vaso de agua bien fría',
    description: 'Toma un vaso de agua fría lentamente para enfriar la tensión del cuerpo antes de responder a cualquier estrés. Sube foto de tu bebida.',
  },
  {
    id: 'eno_5',
    category: 'enojo',
    emoji: '🧹',
    title: 'Canalizar energía ordenando',
    description: 'Usa tu energía intensa para organizar un cajón, escritorio o mesa en 10 minutos. Toma foto del resultado impecable.',
  },
  {
    id: 'eno_6',
    category: 'enojo',
    emoji: '🌳',
    title: 'Cambio de escenario',
    description: 'Sal del lugar donde sentiste irritación y ve a un espacio abierto o ventana por 5 minutos. Toma foto de tu nuevo paisaje.',
  },
  {
    id: 'eno_7',
    category: 'enojo',
    emoji: '😮‍💨',
    title: '10 exhalaciones largas',
    description: 'Inhala por la nariz y suelta el aire largo por la boca 10 veces seguidas soltando los hombros. Comparte foto de tu lugar de respiro.',
  },
  {
    id: 'eno_8',
    category: 'enojo',
    emoji: '🐾',
    title: 'Pausa de ternura',
    description: 'Observa o convive con una mascota, planta o algo tierno que suavice tu día. Tómale una foto y compártela.',
  },
  {
    id: 'eno_9',
    category: 'enojo',
    emoji: '✍️',
    title: 'Lo que sí está en mi control',
    description: 'Escribe en una hoja 2 cosas que SÍ dependen de ti hoy y suelta lo que no. Toma foto de tu lista.',
  },
  {
    id: 'eno_10',
    category: 'enojo',
    emoji: '🚿',
    title: 'Agua que renueva tu humor',
    description: 'Lávate las manos y la cara con calma dejando que el agua se lleve el mal rato. Sube foto de algo que te dé paz.',
  },
  {
    id: 'eno_11',
    category: 'enojo',
    emoji: '🍊',
    title: 'Sabor cítrico o refrescante',
    description: 'Disfruta una fruta fresca, limonada o snack que despierte tus sentidos positivamente. Toma foto de lo que preparaste.',
  },
  {
    id: 'eno_12',
    category: 'enojo',
    emoji: '🧘',
    title: 'Soltar la mandíbula y las manos',
    description: 'Abre y cierra tus manos estirando los dedos y relaja el rostro durante 2 minutos. Toma foto de tu momento de pausa.',
  },
  {
    id: 'eno_13',
    category: 'enojo',
    emoji: '🎨',
    title: 'Colores que calman',
    description: 'Busca algo azul o verde a tu alrededor (el cielo, una planta, un objeto) y tómale foto para enfocar tu mente en serenidad.',
  },
  {
    id: 'eno_14',
    category: 'enojo',
    emoji: '📵',
    title: 'Silenciar lo que altera tu paz',
    description: 'Pon tu teléfono en modo silencio por 20 minutos y dedícate a algo que disfrutes. Toma foto de esa actividad.',
  },
  {
    id: 'eno_15',
    category: 'enojo',
    emoji: '🍵',
    title: 'Pausa cálida a mitad del día',
    description: 'Detén tus actividades 10 minutos para tomar algo rico en silencio. Sube foto de tu descanso.',
  },
  {
    id: 'eno_16',
    category: 'enojo',
    emoji: '🌅',
    title: 'Perspectiva amplia',
    description: 'Mira un horizonte lejano, calle larga o el cielo abierto para recordar que este mal momento es pasajero. Sube tu foto.',
  },
  {
    id: 'eno_17',
    category: 'enojo',
    emoji: '💪',
    title: 'Estiramiento de cuerpo completo',
    description: 'Estira los brazos hacia el techo lo más alto que puedas y suelta de golpe 5 veces. Toma foto de tu espacio de energía.',
  },
  {
    id: 'eno_18',
    category: 'enojo',
    emoji: '💙',
    title: 'Elegir mi tranquilidad hoy',
    description: 'Escribe una frase recordándote: "Mi paz vale más que cualquier enojo". Tómale foto y compártela.',
  },

  // ==================== 4. INSEGURIDAD Y AUTOESTIMA (18 tareas) ====================
  {
    id: 'ins_1',
    category: 'inseguridad',
    emoji: '🌟',
    title: '3 cualidades que valoro de mí',
    description: 'Escribe en una hoja 3 cosas bonitas de tu forma de ser (ej. soy leal, escucho a los demás, no me rindo). Toma foto de tu hoja.',
  },
  {
    id: 'ins_2',
    category: 'inseguridad',
    emoji: '👔',
    title: 'Ponte algo que te haga sentir bien',
    description: 'Hoy usa esa prenda, accesorio o peinado que te gusta cómo te queda, aunque no salgas lejos. Toma foto de un detalle de tu outfit.',
  },
  {
    id: 'ins_3',
    category: 'inseguridad',
    emoji: '🏆',
    title: 'Reconoce un logro tuyo',
    description: 'Recuerda algo difícil que ya superaste en el pasado y escribe por qué estás orgulloso/a de ti. Comparte foto de tu nota o recuerdo.',
  },
  {
    id: 'ins_4',
    category: 'inseguridad',
    emoji: '🪞',
    title: 'Palabra amable frente al espejo',
    description: 'Mírate al espejo hoy y dite en voz alta algo compasivo. Toma una foto de tu espejo o de un mensaje bonito pegado en él.',
  },
  {
    id: 'ins_5',
    category: 'inseguridad',
    emoji: '🌱',
    title: 'Algo que sé hacer muy bien',
    description: 'Dedica 10 minutos a algo que te salga bien (cocinar algo rico, dibujar, ordenar, jugar, cuidar plantas) y presume tu foto.',
  },
  {
    id: 'ins_6',
    category: 'inseguridad',
    emoji: '🛑',
    title: 'Cero comparaciones hoy',
    description: 'Hoy regálate un descanso de compararte con los demás. Toma foto de tu propio camino (tus zapatos, tu escritorio o tus pasos).',
  },
  {
    id: 'ins_7',
    category: 'inseguridad',
    emoji: '💆',
    title: 'Gesto de autocuidado',
    description: 'Dedica 10 minutos a cuidar de ti: hidratar tu piel, peinarte con calma o preparar algo saludable. Sube foto de ese detalle.',
  },
  {
    id: 'ins_8',
    category: 'inseguridad',
    emoji: '💌',
    title: 'Carta a mi yo de hace un año',
    description: 'Escribe un renglón diciéndole a tu yo del pasado: "Seguimos de pie y aprendiendo". Tómale foto a tu mensaje.',
  },
  {
    id: 'ins_9',
    category: 'inseguridad',
    emoji: '🎶',
    title: 'Tu himno de confianza',
    description: 'Escucha una canción que te haga sentir fuerte, capaz y lleno/a de energía. Comparte foto del momento.',
  },
  {
    id: 'ins_10',
    category: 'inseguridad',
    emoji: '🚶',
    title: 'Caminar con la mirada en alto',
    description: 'Sal a caminar 10 minutos manteniendo la espalda erguida y mirando hacia adelante, no al suelo. Toma foto de lo que viste frente a ti.',
  },
  {
    id: 'ins_11',
    category: 'inseguridad',
    emoji: '📚',
    title: 'Aprender un dato o idea nueva',
    description: 'Lee o investiga 5 minutos sobre un tema curioso que te llame la atención. Comparte foto de lo que descubriste.',
  },
  {
    id: 'ins_12',
    category: 'inseguridad',
    emoji: '☕',
    title: 'Cita conmigo mismo/a',
    description: 'Invítate a ti mismo/a un café, postre o paseo tranquilo disfrutando tu propia compañía. Toma foto de tu cita contigo.',
  },
  {
    id: 'ins_13',
    category: 'inseguridad',
    emoji: '✨',
    title: 'Perdonarme un error pequeño',
    description: 'Escribe en una nota: "Aprendo de mis errores con amor, no con castigo". Sube la foto de tu frase.',
  },
  {
    id: 'ins_14',
    category: 'inseguridad',
    emoji: '🎯',
    title: 'Pequeña meta cumplida hoy',
    description: 'Proponte una meta chiquita para los próximos 15 minutos y cúmplela para demostrarte que sí puedes. Sube foto al lograrla.',
  },
  {
    id: 'ins_15',
    category: 'inseguridad',
    emoji: '🌻',
    title: 'Rodearte de lo que te inspira',
    description: 'Coloca cerca de ti un objeto, frase o imagen que te recuerde tus sueños. Tómale una foto.',
  },
  {
    id: 'ins_16',
    category: 'inseguridad',
    emoji: '🗣️',
    title: 'Decir lo que prefiero hoy',
    description: 'Elige hoy algo pensando 100% en tu gusto personal (qué comer, qué música oír, qué color usar). Sube foto de tu elección.',
  },
  {
    id: 'ins_17',
    category: 'inseguridad',
    emoji: '🤍',
    title: 'Agradecer a mi cuerpo',
    description: 'Dedica un momento a agradecer a tus manos, pies y corazón por todo lo que hacen por ti cada día. Comparte una foto simbólica.',
  },
  {
    id: 'ins_18',
    category: 'inseguridad',
    emoji: '👑',
    title: 'Celebrar quién soy hoy',
    description: 'Escribe una cosa que te hace único/a e irrepetible y compártela con orgullo en tu evidencia de hoy.',
  },

  // ==================== 5. ESTRÉS Y AGOTAMIENTO (18 tareas) ====================
  {
    id: 'est_1',
    category: 'estres',
    emoji: '⏸️',
    title: 'Pausa sagrada de 10 minutos',
    description: 'Detén cualquier trabajo o tarea durante 10 minutos completos para sentarte y no hacer absolutamente nada productivo. Sube foto de tu pausa.',
  },
  {
    id: 'est_2',
    category: 'estres',
    emoji: '📋',
    title: 'Solo 3 prioridades hoy',
    description: 'En lugar de una lista interminable, anota solo 3 cosas sencillas para hoy y deja el resto para después. Toma foto de tus 3 puntos.',
  },
  {
    id: 'est_3',
    category: 'estres',
    emoji: '🌳',
    title: 'Respiro de aire fresco',
    description: 'Sal de tu lugar de estudio o trabajo por 5 minutos para mirar árboles, plantas o el cielo. Captura ese respiro en una foto.',
  },
  {
    id: 'est_4',
    category: 'estres',
    emoji: '💧',
    title: 'Pausa de hidratación y estiramiento',
    description: 'Levántate de la silla, bebe un vaso de agua y estira la espalda durante 3 minutos. Sube foto de tu vaso de agua.',
  },
  {
    id: 'est_5',
    category: 'estres',
    emoji: '🖥️',
    title: 'Despejar tu mesa o escritorio',
    description: 'Quita los objetos innecesarios de tu área de trabajo o estudio para que tu mente sienta orden. Toma foto de tu espacio despejado.',
  },
  {
    id: 'est_6',
    category: 'estres',
    emoji: '🍵',
    title: 'Bebida tibia sin mirar el reloj',
    description: 'Tómate un té o bebida favorita lejos de la computadora o pendientes durante 10 minutos. Sube foto de tu taza.',
  },
  {
    id: 'est_7',
    category: 'estres',
    emoji: '🎧',
    title: 'Dos canciones con los ojos cerrados',
    description: 'Recuéstate o siéntate cómodo/a y escucha 2 canciones tranquilas con los ojos cerrados. Toma foto al terminar.',
  },
  {
    id: 'est_8',
    category: 'estres',
    emoji: '🌙',
    title: 'Preparar tu descanso temprano',
    description: 'Hoy deja lista tu cama y apaga luces fuertes 20 minutos antes de dormir para descansar mejor. Toma foto de tu rincón de descanso.',
  },
  {
    id: 'est_9',
    category: 'estres',
    emoji: '🥗',
    title: 'Comida tranquila y nutritiva',
    description: 'Regálate al menos 15 minutos para comer sentado/a con calma, sin correr. Toma foto de tus alimentos.',
  },
  {
    id: 'est_10',
    category: 'estres',
    emoji: '🚶',
    title: 'Caminata de desconexión',
    description: 'Da una vuelta corta a la manzana al terminar tus deberes para marcar el fin del estrés del día. Sube foto de tu caminata.',
  },
  {
    id: 'est_11',
    category: 'estres',
    emoji: '🙅',
    title: 'Permitirme descansar sin culpa',
    description: 'Escribe en una nota: "Descansar también es parte de avanzar" y colócala frente a ti. Tómale foto.',
  },
  {
    id: 'est_12',
    category: 'estres',
    emoji: '🕯️',
    title: 'Rincón de paz vespertino',
    description: 'Crea un ambiente relajado en tu cuarto con luz suave o música bajita al caer la tarde. Sube foto de tu espacio.',
  },
  {
    id: 'est_13',
    category: 'estres',
    emoji: '🤲',
    title: 'Masaje suave en manos y sienes',
    description: 'Dedica 3 minutos a masajear las palmas de tus manos y tus sienes para liberar tensión acumulada. Sube foto de tu momento de calma.',
  },
  {
    id: 'est_14',
    category: 'estres',
    emoji: '📵',
    title: 'Modo avión por 20 minutos',
    description: 'Desconéctate de notificaciones y mensajes durante 20 minutos para recuperar tu silencio interior. Toma foto de lo que hiciste en paz.',
  },
  {
    id: 'est_15',
    category: 'estres',
    emoji: '🌿',
    title: 'Contacto con la naturaleza',
    description: 'Observa de cerca las hojas de una planta o jardín y respira profundo 5 veces. Tómale foto a esa planta.',
  },
  {
    id: 'est_16',
    category: 'estres',
    emoji: '📖',
    title: 'Lectura o pasatiempo ligero',
    description: 'Dedica 10 minutos a algo que no sea obligación (leer, colorear, armar algo, escuchar un podcast). Sube foto.',
  },
  {
    id: 'est_17',
    category: 'estres',
    emoji: '🚿',
    title: 'Soltar el día bajo el agua',
    description: 'Toma un baño relajante dejando que el agua tibia alivie tus hombros y espalda. Comparte una foto de tu noche tranquila.',
  },
  {
    id: 'est_18',
    category: 'estres',
    emoji: '✨',
    title: 'Reconocer todo lo que sí hice hoy',
    description: 'En vez de pensar en lo que faltó, anota 2 cosas que sí lograste terminar hoy y celébralas con una foto.',
  },

  // ==================== 6. FELICIDAD Y GRATITUD (18 tareas) ====================
  {
    id: 'fel_1',
    category: 'felicidad',
    emoji: '☀️',
    title: '3 motivos de gratitud hoy',
    description: 'Anota 3 cosas sencillas por las que hoy te sientes agradecido/a (el sol, un café, una sonrisa) y comparte foto.',
  },
  {
    id: 'fel_2',
    category: 'felicidad',
    emoji: '📸',
    title: 'Capturar la belleza cotidiana',
    description: 'Toma una foto de algo cotidiano que hoy te pareció hermoso (una flor, una nube, una calle, tu mascota).',
  },
  {
    id: 'fel_3',
    category: 'felicidad',
    emoji: '💬',
    title: 'Regalar un cumplido sincero',
    description: 'Dile o escríbele a alguien algo bonito que admires de esa persona hoy. Comparte una foto que represente ese gesto.',
  },
  {
    id: 'fel_4',
    category: 'felicidad',
    emoji: '🎶',
    title: 'Bailar o cantar tu canción favorita',
    description: 'Pon esa canción que te llena de alegría y disfrútala de principio a fin. Sube foto de tu momento musical.',
  },
  {
    id: 'fel_5',
    category: 'felicidad',
    emoji: '🍰',
    title: 'Disfrutar tu antojo favorito',
    description: 'Consiéntete hoy con una bebida, fruta o postre que te encante y compártelo en foto.',
  },
  {
    id: 'fel_6',
    category: 'felicidad',
    emoji: '🚶',
    title: 'Paseo de exploración',
    description: 'Camina por un parque o calle observando los detalles bonitos que antes no habías notado. Toma una foto.',
  },
  {
    id: 'fel_7',
    category: 'felicidad',
    emoji: '🌱',
    title: 'Sembrar o cuidar vida',
    description: 'Cuida tus plantas, jardín o mascota con dedicación especial hoy y tómale una foto.',
  },
  {
    id: 'fel_8',
    category: 'felicidad',
    emoji: '📝',
    title: 'Mensaje positivo para la comunidad',
    description: 'Escribe en una hoja una frase de ánimo para alguien que hoy la esté pasando difícil y sube su foto.',
  },
  {
    id: 'fel_9',
    category: 'felicidad',
    emoji: '🌅',
    title: 'Agradecer la luz del día',
    description: 'Toma una foto de la mañana o del atardecer celebrando la oportunidad de vivir un nuevo día.',
  },
  {
    id: 'fel_10',
    category: 'felicidad',
    emoji: '🎨',
    title: 'Momento creativo libre',
    description: 'Crea algo hoy: una receta rica, un dibujo, una foto artística o reacomodar tu espacio. Presúmelo en foto.',
  },
  {
    id: 'fel_11',
    category: 'felicidad',
    emoji: '📚',
    title: 'Inspiración en páginas',
    description: 'Lee una frase o página de un libro que te inspire a seguir creciendo y tómale foto.',
  },
  {
    id: 'fel_12',
    category: 'felicidad',
    emoji: '🤝',
    title: 'Conectar con alguien querido',
    description: 'Comparte una plática, café o llamada con alguien que te sume paz y alegría. Toma una foto simbólica.',
  },
  {
    id: 'fel_13',
    category: 'felicidad',
    emoji: '🏃',
    title: 'Celebrar la energía de tu cuerpo',
    description: 'Haz 15 minutos de caminata, estiramiento o ejercicio agradeciendo tu vitalidad. Sube foto al terminar.',
  },
  {
    id: 'fel_14',
    category: 'felicidad',
    emoji: '🎯',
    title: 'Visualizar un sueño cercano',
    description: 'Escribe una meta ilusionante que quieras cumplir este mes y tómale foto para recordarla.',
  },
  {
    id: 'fel_15',
    category: 'felicidad',
    emoji: '🍵',
    title: 'Brindis por lo recorrido',
    description: 'Prepara tu bebida favorita y haz un pequeño brindis contigo por todo lo que has crecido. Sube tu foto.',
  },
  {
    id: 'fel_16',
    category: 'felicidad',
    emoji: '🛋️',
    title: 'Disfrutar la paz de tu hogar',
    description: 'Tómale foto al rincón de tu casa o habitación donde te sientes más tranquilo/a y feliz.',
  },
  {
    id: 'fel_17',
    category: 'felicidad',
    emoji: '🌈',
    title: 'Coleccionar el mejor instante de hoy',
    description: 'Elige el momento más bonito de tu día y guárdalo en una fotografía para tu racha.',
  },
  {
    id: 'fel_18',
    category: 'felicidad',
    emoji: '💛',
    title: 'Compartir tu luz',
    description: 'Deja hoy una huella bonita ordenando algo en casa o ayudando a alguien cercano. Comparte foto de tu día.',
  },
];

/**
 * 50 FRASES BONITAS Y MOTIVADORAS PARA ACOMPAÑAR AL USUARIO
 * (En días difíciles, al recorrer un día, al subir evidencia y al concluir los 7 días)
 */
export const STREAK_MOTIVATIONAL_QUOTES: string[] = [
  '1. No tienes que poder con todo hoy; dar un pequeño paso ya es una gran victoria 💙.',
  '2. Si hoy fue un día pesado, respira: mañana el sol vuelve a salir para ti 🌱.',
  '3. Sanar no es una línea recta; cada intento tuyo cuenta y vale muchísimo ✨.',
  '4. Está bien ir despacio, lo importante es que no te has dejado de acompañar 🤍.',
  '5. Tu valor no se mide por un día difícil, sino por el cariño con el que vuelves a empezar 🌤️.',
  '6. Hoy hiciste lo mejor que pudiste con la energía que tenías, y eso es suficiente 💙.',
  '7. Las flores tampoco crecen en un solo día; ten paciencia con tu propio proceso 🌸.',
  '8. Aunque hoy las nubes parezcan grises, tu luz interior sigue intacta ☀️.',
  '9. Date permiso de descansar hoy para volver a intentarlo mañana con más calma 🍃.',
  '10. No estás retrocediendo: estás tomando impulso para seguir adelante 🔥.',
  '11. Cada pequeña acción que haces por ti es un acto enorme de amor propio 💛.',
  '12. Aquí nadie te juzga; vamos a tu ritmo, un día a la vez 🌱.',
  '13. Incluso los árboles más fuertes necesitan doblarse con el viento para no romperse 🌳.',
  '14. Mereces la misma ternura y comprensión que siempre le das a los demás 🤍.',
  '15. Un día difícil no borra todo el camino valiente que ya recorriste ✨.',
  '16. Respira hondo: este momento de tormenta también va a pasar 🌈.',
  '17. Qué orgullo verte intentar cuidar de ti, incluso cuando cuesta trabajo 💙.',
  '18. Tu corazón ha superado el 100% de tus días más difíciles hasta hoy 💪.',
  '19. No necesitas correr; caminar paso a paso también te lleva a lugares hermosos 🛤️.',
  '20. Hoy sembraste una pequeña semilla de bienestar que pronto verás florecer 🌻.',
  '21. Sé amable contigo hoy: estás aprendiendo a sanar cosas que nadie te enseñó a cargar 🕊️.',
  '22. Cuando sientas que no puedes más, recuerda que en Entre Nosotros nunca estás solo/a 💙.',
  '23. Reponer un día no es fallar, es elegir no rendirte contigo mismo/a 🔥.',
  '24. La calma llega cuando dejas de exigirte perfección y eliges tratarte con amor ✨.',
  '25. Poco a poco, lo que hoy duele se irá transformando en fortaleza interior 🌱.',
  '26. Celebra tus pequeños avances: salir de la cama, tomar agua, respirar consciente ☀️.',
  '27. Tu historia todavía tiene capítulos llenos de paz y alegría esperándote 📖.',
  '28. No te compares con el ritmo de nadie; tu camino es único y valioso 🌟.',
  '29. A veces el acto más valiente del día es simplemente pedir un respiro y continuar mañana 🍃.',
  '30. Mira todo lo que has avanzado desde que decidiste darte esta oportunidad 💛.',
  '31. Tu bienestar emocional es el regalo más grande que puedes construir día a día 🎁.',
  '32. Cada vez que eliges cuidarte, le enseñas a tu mente que mereces estar en paz 🌤️.',
  '33. Que hoy te abraces con paciencia y sueltes lo que ya no necesitas cargar 🤍.',
  '34. No importa cuántas veces pauses, importa el amor con el que retomas tu camino 🔥.',
  '35. Hay días para brillar con fuerza y días para abrigarse el corazón; ambos son válidos 💙.',
  '36. Paso a paso estás construyendo una versión de ti más tranquila y libre 🦋.',
  '37. Gracias por no soltarte la mano en los momentos en que más te necesitabas 🌱.',
  '38. La paz interior se construye con pequeños gestos cotidianos como el que hiciste hoy ✨.',
  '39. Confía en ti: tienes dentro la fuerza suave que convierte los días grises en aprendizaje 🌈.',
  '40. Hoy diste un paso real por tu salud emocional, y eso merece celebrarse 🏆.',
  '41. Nunca subestimes el poder de una caminata, una canción o un respiro profundo 🎧.',
  '42. Estás rodeado/a de una comunidad que celebra cada uno de tus avances 💙.',
  '43. Si hoy necesitas pausar, aquí te espero mañana con los brazos abiertos 🤗.',
  '44. La constancia no es no caer nunca, es volver a levantarse con una sonrisa amable ☀️.',
  '45. Todo gran cambio comienza con la decisión valiente de intentarlo un día más 🔥.',
  '46. Qué bonito es ver cómo transformas tus emociones en pasos llenos de vida 🌸.',
  '47. Recuerda siempre: eres mucho más fuerte y valioso/a de lo que tus dudas te dicen 👑.',
  '48. Cada foto de tu camino es la prueba viva de que sí se puede salir adelante 📸.',
  '49. Hoy tu corazón respira un poquito más ligero gracias a tu constancia 🍃.',
  '50. ¡Lo estás logrando! Sigue caminando con esa luz tan bonita que llevas dentro ✨.',
];

const DAY_NAMES = [
  'Día 1 • El Primer Paso',
  'Día 2 • Reconectando',
  'Día 3 • Soltando Carga',
  'Día 4 • Mitad del Camino',
  'Día 5 • Nueva Energía',
  'Día 6 • Floreciendo',
  'Día 7 • Meta Cumplida',
];

/**
 * Picks a random motivational quote (stripping the leading number for clean display)
 */
export const getRandomStreakMotivationalQuote = (): string => {
  const raw =
    STREAK_MOTIVATIONAL_QUOTES[
      Math.floor(Math.random() * STREAK_MOTIVATIONAL_QUOTES.length)
    ] || STREAK_MOTIVATIONAL_QUOTES[0];
  return raw.replace(/^\d+\.\s*/, '');
};

/**
 * Selects 7 randomized, non-repeating tasks tailored to the user's emotional focus category
 * (5 from their primary category + 2 complementary wellness tasks for rich variety)
 */
export const generateSevenDayTasksForUser = (
  category: EmotionalFocusCategory,
  userId?: string
): StreakDayProgress[] => {
  const primaryPool = ALL_STREAK_TASKS.filter((t) => t.category === category);
  const secondaryPool = ALL_STREAK_TASKS.filter((t) => t.category !== category);

  // Shuffle helper with random entropy + userId character mix
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

  const shuffledPrimary = shuffle(primaryPool);
  const shuffledSecondary = shuffle(secondaryPool);

  const selectedTasks: StreakTaskItem[] = [
    ...shuffledPrimary.slice(0, 5),
    ...shuffledSecondary.slice(0, 2),
  ];

  const finalSeven = shuffle(selectedTasks).slice(0, 7);

  return finalSeven.map((task, idx) => ({
    dayNumber: idx + 1,
    dayName: DAY_NAMES[idx] || `Día ${idx + 1}`,
    task,
    status: idx === 0 ? 'unlocked' : 'locked',
    postponedCount: 0,
  }));
};
