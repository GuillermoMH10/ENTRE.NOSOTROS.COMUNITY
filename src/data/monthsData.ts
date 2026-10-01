import { MONTH_IMAGE_URLS } from '../config/monthImages';

export interface MonthTheme {
  id: number; // 0 for Enero, 1 for Febrero, ... 11 for Diciembre
  name: string;
  themeTitle: string;
  subtitle: string;
  colorName: string;
  primaryColor: string;
  lightBackground: string;
  darkColor: string;
  accentColor: string;
  iconName: string;
  imageUrl: string;
  colorPsychology: string;
  speech: string;
  preventionTips: {
    title: string;
    description: string;
    icon: string;
  }[];
  mantra: string;
}

const RAW_MONTHS_DATA: Omit<MonthTheme, 'imageUrl'>[] = [
  {
    id: 0,
    name: 'Enero',
    themeTitle: 'Nuevos Comienzos y Gestión de la Ansiedad',
    subtitle: 'Mes de la Serenidad y la Renovación Mental',
    colorName: 'Azul Cielo (Serenidad)',
    primaryColor: '#2563EB',
    lightBackground: '#EFF6FF',
    darkColor: '#1E3A8A',
    accentColor: '#3B82F6',
    iconName: 'sunny-outline',
    colorPsychology: 'En psicología, el azul evoca calma profunda, reduce la frecuencia cardíaca y estimula la claridad mental, invitándote a soltar las prisas y abrazar la paz interior.',
    speech: 'Un nuevo año no exige que te reinventes por completo de la noche a la mañana. Enero es una invitación a pausar, respirar profundo y entender que cada día es una oportunidad para empezar de nuevo con amabilidad hacia ti mismo. No necesitas tener todas las respuestas hoy; basta con dar el siguiente paso con fe y tranquilidad.',
    preventionTips: [
      {
        title: 'Establece metas compasivas',
        description: 'Prioriza metas realistas y medibles. Divide tus objetivos en pequeños pasos diarios sin sobreexigirte.',
        icon: 'checkmark-done-circle-outline',
      },
      {
        title: 'Practica la respiración consciente',
        description: 'Dedica 5 minutos al despertar para inhalar en 4 segundos, retener 4 y exhalar en 6.',
        icon: 'water-outline',
      },
      {
        title: 'Limpia el diálogo interno',
        description: 'Háblate como le hablarías a tu mejor amigo. La autocrítica severa no genera cambios duraderos.',
        icon: 'heart-outline',
      },
    ],
    mantra: '«Hoy elijo la calma sobre la prisa. Me permito avanzar a mi propio ritmo.»',
  },
  {
    id: 1,
    name: 'Febrero',
    themeTitle: 'Amor Propio y Aceptación Corporal',
    subtitle: 'Prevención de TCA y Vínculos Sanos',
    colorName: 'Rosa Cálido (Empatía)',
    primaryColor: '#DB2777',
    lightBackground: '#FDF2F8',
    darkColor: '#831843',
    accentColor: '#F472B6',
    iconName: 'heart-circle-outline',
    colorPsychology: 'El rosa y magenta suave activan la sensación de ternura, acogida, autocompasión y desarman la hostilidad, recordándonos la importancia de amarnos sin condiciones.',
    speech: 'El amor más transformador y duradero comienza en el espejo. Febrero nos recuerda que tu valor como ser humano jamás ha dependido de una talla, de la aprobación ajena ni de la perfección. Abrazar tus vulnerabilidades y tratarte con respeto es el verdadero acto de valentía que abre las puertas a relaciones sanas.',
    preventionTips: [
      {
        title: 'Cultiva la compasión corporal',
        description: 'Agradece a tu cuerpo por lo que te permite vivir y sentir en lugar de juzgarlo solo por su aspecto.',
        icon: 'body-outline',
      },
      {
        title: 'Límites en tus relaciones',
        description: 'Aprender a decir «no» sin sentir culpa es un pilar fundamental para proteger tu paz mental.',
        icon: 'shield-outline',
      },
      {
        title: 'Filtra tus redes sociales',
        description: 'Deja de seguir cuentas que te hagan dudar de tu valor o detonen comparaciones tóxicas.',
        icon: 'eye-off-outline',
      },
    ],
    mantra: '«Merezco amor, respeto y ternura, empezando por el amor que me doy a mí mismo.»',
  },
  {
    id: 2,
    name: 'Marzo',
    themeTitle: 'Conciencia de la Autolesión y Resiliencia',
    subtitle: 'Transformar el Dolor en Palabras y Arte',
    colorName: 'Naranja Esperanza (Vitalidad)',
    primaryColor: '#EA580C',
    lightBackground: '#FFF7ED',
    darkColor: '#7C2D12',
    accentColor: '#FB923C',
    iconName: 'flame-outline',
    colorPsychology: 'El naranja simboliza el renacer, el coraje, la vitalidad emocional y la calidez humana que disipa el aislamiento.',
    speech: 'El sufrimiento emocional puede sentirse abrumador, pero lastimarte nunca será la solución que tu alma necesita. Marzo nos convoca a romper el silencio: detrás de cada herida hay una historia que merece ser escuchada con empatía. No estás solo en esta batalla; existe ayuda profesional y manos dispuestas a sostenerte.',
    preventionTips: [
      {
        title: 'Canaliza la emoción intensa',
        description: 'Cuando la angustia suba, dibuja, escribe una carta que luego puedas romper o abraza un cubo de hielo.',
        icon: 'brush-outline',
      },
      {
        title: 'Red de seguridad',
        description: 'Guarda en tu teléfono el contacto de 3 personas de confianza o una línea de ayuda psicológica a las que puedas llamar.',
        icon: 'call-outline',
      },
      {
        title: 'Valida tu sentir sin juzgar',
        description: 'Tus emociones no son peligrosas; son señales de que algo te duele y necesita atención profesional.',
        icon: 'chatbubble-ellipses-outline',
      },
    ],
    mantra: '«Mi dolor es temporal, pero mi vida es valiosa. Elijo sanar con paciencia y ayuda.»',
  },
  {
    id: 3,
    name: 'Abril',
    themeTitle: 'Manejo del Estrés y Neurodiversidad',
    subtitle: 'Conciencia sobre el Autismo y Pausas Conscientes',
    colorName: 'Turquesa Menta (Equilibrio)',
    primaryColor: '#0D9488',
    lightBackground: '#F0FDFA',
    darkColor: '#134E4A',
    accentColor: '#2DD4BF',
    iconName: 'leaf-outline',
    colorPsychology: 'El turquesa une la serenidad del azul con el crecimiento del verde, favoreciendo el balance emocional, la empatía hacia diferentes formas de pensar y el alivio del estrés.',
    speech: 'Vivimos en un mundo acelerado que muchas veces nos exige sobrepasar nuestros límites. Abril nos invita a honrar el descanso como un derecho sagrado y a celebrar la diversidad de cada mente. Cada persona percibe y siente el mundo de manera única; la verdadera inclusión nace de la escucha y el respeto.',
    preventionTips: [
      {
        title: 'Micropausas de desconexión',
        description: 'Cada 90 minutos de trabajo, tómate 3 minutos lejos de pantallas para estirar tu cuerpo y relajar la vista.',
        icon: 'timer-outline',
      },
      {
        title: 'Respeto a la neurodiversidad',
        description: 'Sé paciente y empático con las formas de comunicación y procesamiento sensorial de quienes te rodean.',
        icon: 'people-outline',
      },
      {
        title: 'Contacto con la naturaleza',
        description: 'Caminar 15 minutos en un parque reduce significativamente los niveles de cortisol en el cerebro.',
        icon: 'flower-outline',
      },
    ],
    mantra: '«Acepto mi ritmo único y me doy permiso de descansar para recargar mi energía.»',
  },
  {
    id: 4,
    name: 'Mayo',
    themeTitle: 'Salud Mental y Bienestar Emocional',
    subtitle: 'Rompiendo Estigmas y Promoviendo la Terapia',
    colorName: 'Verde Esperanza (Renovación)',
    primaryColor: '#16A34A',
    lightBackground: '#F0FDF4',
    darkColor: '#14532D',
    accentColor: '#4ADE80',
    iconName: 'sparkles-outline',
    colorPsychology: 'El verde es el color por excelencia de la salud mental a nivel internacional; representa vida, esperanza, regeneración biológica y armonía psíquica.',
    speech: 'Cuidar de tu mente no es un lujo ni una señal de fragilidad: es el acto de amor propio más valiente que existe. Mayo es el recordatorio universal de que pedir ayuda psicológica es tan natural y necesario como acudir al médico por un dolor físico. Rompamos los tabúes juntos: hablar salva vidas.',
    preventionTips: [
      {
        title: 'Normaliza ir a terapia',
        description: 'La terapia no es solo para crisis graves; es un espacio seguro para conocerte y adquirir herramientas.',
        icon: 'chatbubbles-outline',
      },
      {
        title: 'Conversaciones abiertas',
        description: 'Pregúntale a un ser querido: «¿Cómo estás realmente?» y escucha con el corazón sin juzgar.',
        icon: 'ear-outline',
      },
      {
        title: 'Higiene del sueño',
        description: 'Mantén un horario regular para dormir. El descanso profundo es el pilar de la salud cognitiva.',
        icon: 'moon-outline',
      },
    ],
    mantra: '«Cuidar mi salud mental es mi prioridad. Pedir apoyo me hace más fuerte.»',
  },
  {
    id: 5,
    name: 'Junio',
    themeTitle: 'Identidad, Diversidad y Espacios Seguros',
    subtitle: 'Salud Mental en la Diversidad y Pertenencia',
    colorName: 'Lavanda Violeta (Inclusión)',
    primaryColor: '#7C3AED',
    lightBackground: '#F5F3FF',
    darkColor: '#4C1D95',
    accentColor: '#A78BFA',
    iconName: 'color-palette-outline',
    colorPsychology: 'El violeta y lavanda conectan con la sabiduría, la autenticidad, la espiritualidad y la compasión hacia la identidad propia y colectiva.',
    speech: 'Tu autenticidad es tu mayor tesoro. Junio nos enseña que nadie debería tener que ocultar quién es por miedo al rechazo o la discriminación. Construir comunidades empáticas y comprensivas disminuye drásticamente la soledad y la depresión. Tienes derecho a brillar con tu propia luz en un entorno libre de violencia.',
    preventionTips: [
      {
        title: 'Rodéate de entornos seguros',
        description: 'Busca comunidades y amistades que celebren tu esencia y respeten tus decisiones de vida.',
        icon: 'shield-checkmark-outline',
      },
      {
        title: 'Práctica la autoafirmación',
        description: 'Escribe diariamente tres aspectos auténticos de tu personalidad de los que te sientas orgulloso.',
        icon: 'star-outline',
      },
      {
        title: 'Erradica el juicio ajeno',
        description: 'No podemos controlar lo que piensan los demás, pero sí cuánto poder les otorgamos sobre nuestro bienestar.',
        icon: 'hand-left-outline',
      },
    ],
    mantra: '«Soy digno de respeto, amor y felicidad siendo plenamente quien soy.»',
  },
  {
    id: 6,
    name: 'Julio',
    themeTitle: 'Prevención del Burnout y Sobrecarga',
    subtitle: 'Recuperar la Energía y el Entusiasmo',
    colorName: 'Ámbar Solar (Energía)',
    primaryColor: '#D97706',
    lightBackground: '#FFFBEB',
    darkColor: '#78350F',
    accentColor: '#FBBF24',
    iconName: 'partly-sunny-outline',
    colorPsychology: 'El ámbar solar aporta optimismo, calidez y motivación, reactivando la fuerza de voluntad cuando el cansancio emocional se apodera del cuerpo.',
    speech: 'No tienes que ser fuerte todo el tiempo ni cargar el peso del mundo sobre tus hombros. Julio nos recuerda que la productividad sin descanso conduce al agotamiento mental y físico. Aprender a soltar responsabilidades ajenas y regalarte tiempo de ocio sin remordimiento es clave para reencontrarte con la alegría.',
    preventionTips: [
      {
        title: 'Aprende a delegar',
        description: 'Reconoce que no todo depende exclusivamente de ti. Pide apoyo a tu equipo, familia o amigos.',
        icon: 'git-merge-outline',
      },
      {
        title: 'Desconexión digital',
        description: 'Establece una hora límite en la noche para apagar notificaciones de trabajo o estudio.',
        icon: 'notifications-off-outline',
      },
      {
        title: 'Reconéctate con un pasatiempo',
        description: 'Haz algo solo por el placer de disfrutarlo: pintar, escuchar música, jardinería o cocinar.',
        icon: 'musical-notes-outline',
      },
    ],
    mantra: '«Mi bienestar está por encima de la prisa. Merezco tiempo libre para recargarme.»',
  },
  {
    id: 7,
    name: 'Agosto',
    themeTitle: 'Duelo, Cierre de Ciclos y Paz Interior',
    subtitle: 'Sanación del Corazón y Aceptación Emocional',
    colorName: 'Cian Profundo (Tranquilidad)',
    primaryColor: '#0284C7',
    lightBackground: '#F0F9FF',
    darkColor: '#075985',
    accentColor: '#38BDF8',
    iconName: 'infinite-outline',
    colorPsychology: 'El cian profundo evoca la inmensidad del mar y el cielo, transmitiendo alivio, serenidad en momentos de despedida y desahogo de emociones reprimidas.',
    speech: 'Toda despedida o pérdida duele profundamente, ya sea de un ser querido, una relación, un trabajo o un sueño. Agosto nos abraza en el proceso de duelo: sentir tristeza no es retroceder, es el tributo que el corazón rinde a lo que fue valioso. Date tiempo para sanar sin presiones; cada herida cicatriza con paciencia y amor.',
    preventionTips: [
      {
        title: 'Permítete sentir el dolor',
        description: 'Llorar y expresar la tristeza es el camino natural de desintoxicación emocional del organismo.',
        icon: 'water-outline',
      },
      {
        title: 'Rituales de agradecimiento',
        description: 'Escribe cartas de agradecimiento y despedida hacia lo que necesitas soltar para abrir espacio a lo nuevo.',
        icon: 'document-text-outline',
      },
      {
        title: 'Apoyo en el duelo',
        description: 'Si el dolor se prolonga y te impide continuar tu vida cotidiana, busca acompañamiento tanatológico.',
        icon: 'heart-half-outline',
      },
    ],
    mantra: '«Acepto los ciclos de la vida. Con amor suelto el pasado y confío en mi proceso de sanación.»',
  },
  {
    id: 8,
    name: 'Septiembre',
    themeTitle: 'Prevención del Suicidio',
    subtitle: 'Luz, Escucha Compasiva y Esperanza Viva',
    colorName: 'Amarillo Oro (Luz y Vida)',
    primaryColor: '#CA8A04',
    lightBackground: '#FEFCE8',
    darkColor: '#713F12',
    accentColor: '#FACC15',
    iconName: 'sunny',
    colorPsychology: 'El amarillo es el símbolo internacional de la prevención del suicidio (Septiembre Amarillo); encarna la luz que ilumina la oscuridad, la esperanza inquebrantable y el valor supremo de la vida.',
    speech: 'Tu presencia en este mundo es irremplazable y profundamente necesaria. En los momentos más sombríos, cuando la mente nos engaña haciéndonos creer que no hay salida, recuerda que el dolor que sientes es temporal, pero tu vida es infinita en posibilidades. No tienes que atravesar esta tormenta solo: tender la mano y pedir ayuda es el primer paso hacia una nueva aurora.',
    preventionTips: [
      {
        title: 'Atención a las señales de alarma',
        description: 'Aislamiento repentino, desinterés por la vida o frases de desesperanza son llamados urgentes de ayuda.',
        icon: 'alert-circle-outline',
      },
      {
        title: 'Escucha sin juzgar ni minimizar',
        description: 'Evita frases como «no es para tanto» o «échale ganas». Mejor di: «Estoy contigo y vamos a buscar apoyo juntos».',
        icon: 'hand-right-outline',
      },
      {
        title: 'Líneas de emergencia gratuitas',
        description: 'En caso de crisis inmediata, acude a los servicios de salud locales o líneas telefónicas de asistencia 24/7.',
        icon: 'call-outline',
      },
    ],
    mantra: '«Mi vida tiene un propósito valioso. Hoy elijo quedarme y creer en la esperanza.»',
  },
  {
    id: 9,
    name: 'Octubre',
    themeTitle: 'Día Mundial de la Salud Mental y Empatía',
    subtitle: 'Conexión Humana, Bienestar y Resiliencia',
    colorName: 'Verde Jade (Bienestar Integral)',
    primaryColor: '#059669',
    lightBackground: '#ECFDF5',
    darkColor: '#064E3B',
    accentColor: '#34D399',
    iconName: 'globe-outline',
    colorPsychology: 'El verde esmeralda y jade estimula el equilibrio fisiológico, la compasión mutua y el compromiso con la salud preventiva.',
    speech: 'El 10 de octubre conmemoramos el Día Mundial de la Salud Mental para recordar que la mente y las emociones merecen el mismo cuidado respetuoso que cualquier otra parte de nuestro ser. Fomentar comunidades empáticas donde cada persona se sienta comprendida y valorada es la mejor vacuna contra la depresión y la soledad.',
    preventionTips: [
      {
        title: 'Chequeo emocional regular',
        description: 'Pregúntate con frecuencia: «¿Cómo me siento en este momento y qué necesito para estar mejor?»',
        icon: 'fitness-outline',
      },
      {
        title: 'Crea vínculos de calidad',
        description: 'Pasa tiempo de calidad con amigos y familiares. La conexión social genuina protege la salud cerebral.',
        icon: 'people-circle-outline',
      },
      {
        title: 'Mindfulness y presencia',
        description: 'Enfoca tu atención en el presente en lugar de rumiar el pasado o angustiarte por el porvenir.',
        icon: 'compass-outline',
      },
    ],
    mantra: '«Invierto en mi paz mental cada día. Mi bienestar es el mejor regalo que puedo ofrecerme.»',
  },
  {
    id: 10,
    name: 'Noviembre',
    themeTitle: 'Salud Emocional Masculina y Expresión',
    subtitle: 'Vulnerabilidad Saludable y Movember Emocional',
    colorName: 'Azul Índigo (Introspección)',
    primaryColor: '#4F46E5',
    lightBackground: '#EEF2FF',
    darkColor: '#312E81',
    accentColor: '#818CF8',
    iconName: 'shield-outline',
    colorPsychology: 'El índigo y azul cobalto facilitan la reflexión interna profunda, la introspección serena y el desmontaje de bloqueos emocionales arraigados.',
    speech: 'Expresar tus emociones, pedir un abrazo o admitir que necesitas ayuda no te hace menos fuerte; te hace profundamente humano. Noviembre nos convoca a derribar mandatos obsoletos que silencian el dolor emocional. Llorar, hablar y sanar es un acto de valentía que libera el alma y fortalece los lazos.',
    preventionTips: [
      {
        title: 'Desmonta mitos emocionales',
        description: 'La vulnerabilidad no es debilidad; es la raíz de la empatía, el coraje y la verdadera conexión humana.',
        icon: 'bulb-outline',
      },
      {
        title: 'Expresa lo que sientes a tiempo',
        description: 'Guardar el dolor en silencio genera somatización y estrés crónico. Busca personas con quienes abrirte.',
        icon: 'chatbubble-outline',
      },
      {
        title: 'Cuida tu salud física y mental',
        description: 'Realiza ejercicio moderado y revisiones médicas integrales periódicamente.',
        icon: 'walk-outline',
      },
    ],
    mantra: '«Tengo la libertad de sentir y expresarme. Mi sensibilidad es una fortaleza.»',
  },
  {
    id: 11,
    name: 'Diciembre',
    themeTitle: 'Gratitud, Duelo Festivo y Paz de Fin de Año',
    subtitle: 'Abrazar el Recorrido y Cerrar con Gratitud',
    colorName: 'Esmeralda Calmo (Paz)',
    primaryColor: '#0F766E',
    lightBackground: '#F0FDFA',
    darkColor: '#134E4A',
    accentColor: '#2DD4BF',
    iconName: 'gift-outline',
    colorPsychology: 'El verde esmeralda profundo representa estabilidad, madurez, agradecimiento por los aprendizajes y serenidad durante los balances anuales.',
    speech: 'Diciembre no solo es fiesta; para muchas personas es una época de nostalgia, reflexión o soledad. Si este año ha sido difícil, felicítate por haber llegado hasta aquí con resiliencia y coraje. No necesitas cumplir todas las expectativas sociales: regálate paz, agradece tus victorias silenciosas y abrázate con ternura.',
    preventionTips: [
      {
        title: 'Diario de gratitud',
        description: 'Apunta 3 cosas que agradeces de tu crecimiento personal a lo largo de este año.',
        icon: 'book-outline',
      },
      {
        title: 'Manejo de expectativas festivas',
        description: 'Pasa las fiestas como tú decidas que sea mejor para tu paz mental, sin presiones externas.',
        icon: 'sparkles-outline',
      },
      {
        title: 'Honra a quienes extrañas',
        description: 'Si sientes nostalgia por ausencias queridas, dedica un momento íntimo para recordarles con amor.',
        icon: 'heart-outline',
      },
    ],
    mantra: '«Agradezco mi valentía y resiliencia. Cierro este ciclo en paz y con esperanza en el corazón.»',
  },
];

export const MONTHS_DATA: MonthTheme[] = RAW_MONTHS_DATA.map((item) => ({
  ...item,
  imageUrl: MONTH_IMAGE_URLS[item.id] || '',
}));
