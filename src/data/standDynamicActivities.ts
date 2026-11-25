export interface StandActivity {
  id: number;
  category: 'Foto' | 'Consejo';
  title: string;
  prompt: string;
  actionType: 'photo' | 'text' | 'text_or_photo';
  placeholder: string;
}

export const STAND_ACTIVITIES: StandActivity[] = [
  // --- FOTOS ---
  {
    id: 1,
    category: 'Foto',
    title: 'Sonrisa en el Stand',
    prompt: 'Tómate una foto en nuestro stand o en el evento y compártela para transmitir buena energía a la comunidad.',
    actionType: 'photo',
    placeholder: 'Un saludo desde el stand de Entre Nosotros...',
  },
  {
    id: 2,
    category: 'Foto',
    title: 'Foto con quien te acompaña',
    prompt: 'Captura una foto con la persona o personas que vinieron contigo hoy y dedícales unas palabras.',
    actionType: 'photo',
    placeholder: 'Acompañado de las mejores personas...',
  },
  {
    id: 3,
    category: 'Foto',
    title: 'Tu mejor actitud',
    prompt: 'Comparte una foto que refleje tu mejor actitud hoy para motivar a quienes visiten el muro.',
    actionType: 'photo',
    placeholder: 'Con la mejor actitud para este día...',
  },
  {
    id: 4,
    category: 'Foto',
    title: 'Algo que te transmita paz',
    prompt: 'Toma una foto de un detalle, rincón o elemento del lugar que te transmita serenidad en este momento.',
    actionType: 'photo',
    placeholder: 'Este momento y lugar me transmiten tranquilidad...',
  },
  {
    id: 5,
    category: 'Foto',
    title: 'Foto con nuestro equipo',
    prompt: 'Pídele una foto a los miembros del stand de Entre Nosotros y comparte tu experiencia con nosotros.',
    actionType: 'photo',
    placeholder: 'Conociendo al equipo de Entre Nosotros...',
  },
  {
    id: 6,
    category: 'Foto',
    title: 'Gesto de apoyo',
    prompt: 'Tómate una foto haciendo un gesto de ánimo (pulgar arriba o saludo) para la comunidad.',
    actionType: 'photo',
    placeholder: 'Un saludo con mucho ánimo para todos...',
  },
  {
    id: 7,
    category: 'Foto',
    title: 'Tu perspectiva del evento',
    prompt: 'Muestra en una fotografía tu perspectiva favorita del evento desde donde estás parado ahora.',
    actionType: 'photo',
    placeholder: 'Disfrutando el ambiente del evento...',
  },
  {
    id: 8,
    category: 'Foto',
    title: 'Mirada hacia adelante',
    prompt: 'Tómate una foto viendo hacia adelante, simbolizando el compromiso de seguir avanzando.',
    actionType: 'photo',
    placeholder: 'Mirando hacia adelante con determinación...',
  },

  // --- CONSEJOS ---
  {
    id: 9,
    category: 'Consejo',
    title: 'Palabras de aliento',
    prompt: 'Escribe un consejo para alguien que hoy pueda estar atravesando por un momento difícil o de incertidumbre.',
    actionType: 'text',
    placeholder: 'Recuerda que los días difíciles también terminan y...',
  },
  {
    id: 10,
    category: 'Consejo',
    title: 'Mensaje a tu yo del pasado',
    prompt: '¿Qué consejo le darías hoy a tu versión de hace unos años para calmar sus preocupaciones?',
    actionType: 'text',
    placeholder: 'Le diría que no se preocupe tanto, porque al final...',
  },
  {
    id: 11,
    category: 'Consejo',
    title: 'Frase que te sostiene',
    prompt: 'Comparte la frase o pensamiento que más te ayuda a mantener la calma cuando sientes presión.',
    actionType: 'text',
    placeholder: 'La frase que siempre me repito es...',
  },
  {
    id: 12,
    category: 'Consejo',
    title: 'El valor de pedir ayuda',
    prompt: 'Escribe unas palabras sobre por qué buscar apoyo emocional o profesional es un acto de valentía.',
    actionType: 'text',
    placeholder: 'Pedir ayuda no es señal de debilidad, sino de...',
  },
  {
    id: 13,
    category: 'Consejo',
    title: 'Consejo para soltar el control',
    prompt: 'Comparte un consejo práctico que te sirva para dejar ir lo que no está en tus manos cambiar.',
    actionType: 'text',
    placeholder: 'Cuando algo escapa de mi control, lo que hago es...',
  },
  {
    id: 14,
    category: 'Consejo',
    title: 'Recordatorio de paciencia',
    prompt: 'Deja un consejo sobre la importancia de ser paciente con nuestros propios procesos y tiempos.',
    actionType: 'text',
    placeholder: 'Cada quien lleva su propio ritmo, por eso es importante...',
  },
  {
    id: 15,
    category: 'Consejo',
    title: 'Un hábito que te cambió',
    prompt: 'Comparte un hábito o cambio pequeño en tu rutina que haya mejorado notablemente tu bienestar mental.',
    actionType: 'text',
    placeholder: 'El pequeño hábito que más me ha ayudado es...',
  },
  {
    id: 16,
    category: 'Consejo',
    title: 'Consejo para cultivar gratitud',
    prompt: '¿Cómo haces para recordar las cosas valiosas de tu vida incluso cuando tienes un mal día?',
    actionType: 'text',
    placeholder: 'Para no perder la perspectiva en días pesados, suelo...',
  },
  {
    id: 17,
    category: 'Consejo',
    title: 'Cómo acompañar a un amigo',
    prompt: 'Deja un consejo sobre cómo escuchar y acompañar a un ser querido que no se siente bien emocionalmente.',
    actionType: 'text',
    placeholder: 'A veces lo que más ayuda a un amigo no es darle soluciones, sino...',
  },
  {
    id: 18,
    category: 'Consejo',
    title: 'Mensaje de autocuidado',
    prompt: 'Escribe un recordatorio sincero sobre la importancia de descansar y no exigirse de más.',
    actionType: 'text',
    placeholder: 'Descansar también es parte del camino, recuerda...',
  },
  {
    id: 19,
    category: 'Consejo',
    title: 'Aprender de los errores',
    prompt: 'Comparte qué aprendizaje positivo rescatas de un tropiezo que al inicio te causó mucho dolor.',
    actionType: 'text',
    placeholder: 'Ese tropiezo me enseñó que...',
  },
  {
    id: 20,
    category: 'Consejo',
    title: 'Un motivo para sonreír',
    prompt: 'Comparte un consejo o reflexión para encontrar motivos de alegría en lo cotidiano.',
    actionType: 'text',
    placeholder: 'Siempre hay un motivo para sonreír cuando prestamos atención a...',
  },
];

export function getRandomStandActivity(): StandActivity {
  const index = Math.floor(Math.random() * STAND_ACTIVITIES.length);
  return STAND_ACTIVITIES[index];
}

export const ANIMA_CONGRATS_ADVICE: string[] = [
  'Muchas gracias por sumarte a Entre Nosotros. Tus palabras y tu presencia aportan un gran valor a esta comunidad.',
  'Tu aporte ya forma parte de nuestro muro. A veces una sola frase o una imagen positiva puede cambiar el día de quien la lee.',
  'Gracias por participar en nuestro stand. Cuidar de nuestro bienestar emocional y conectar con otros es un paso fundamental.',
  'Agradecemos sinceramente tu colaboración. Compartir experiencias y consejos fortalece los lazos de apoyo mutuo.',
  'Gracias por acompañarnos el día de hoy. Esperamos que esta visita sea el inicio de un espacio seguro para ti.',
];

export function getRandomAnimaAdvice(): string {
  const idx = Math.floor(Math.random() * ANIMA_CONGRATS_ADVICE.length);
  return ANIMA_CONGRATS_ADVICE[idx];
}
