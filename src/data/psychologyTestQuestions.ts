import { TestQuestion, TestOption, TestResult, DimensionScore, TestDimensionKey } from '../types/psychologyTest';

export const TEST_OPTIONS: TestOption[] = [
  {
    value: 0,
    emoji: '😊',
    label: 'Nunca',
    sublabel: 'Nada en absoluto',
  },
  {
    value: 1,
    emoji: '🙂',
    label: 'Pocas veces',
    sublabel: 'Rara vez / Leve',
  },
  {
    value: 2,
    emoji: '😐',
    label: 'Frecuentemente',
    sublabel: 'Varios días / Notable',
  },
  {
    value: 3,
    emoji: '😔',
    label: 'Casi siempre',
    sublabel: 'A diario / Muy intenso',
  },
];

export const TEST_QUESTIONS: TestQuestion[] = [
  // --- Dimensión 1: Estado de Ánimo & Depresión ---
  {
    id: 1,
    dimension: 'animo_depresion',
    dimensionLabel: 'Estado de Ánimo',
    dimensionIcon: 'heart-outline',
    question: '¿Has sentido tristeza, vacío o desánimo la mayor parte del día?',
    subtitle: 'Sensación de pesadumbre o falta de ganas para realizar tus actividades habituales.',
  },
  {
    id: 2,
    dimension: 'animo_depresion',
    dimensionLabel: 'Estado de Ánimo',
    dimensionIcon: 'heart-outline',
    question: '¿Has perdido el interés o el placer por las cosas que antes disfrutabas?',
    subtitle: 'Dificultad para conectar con momentos de alegría o entusiasmo.',
  },
  {
    id: 3,
    dimension: 'animo_depresion',
    dimensionLabel: 'Estado de Ánimo',
    dimensionIcon: 'heart-outline',
    question: '¿Sientes falta de esperanza o dudas sobre el futuro?',
    subtitle: 'Pensamientos de que las situaciones difíciles nunca mejorarán.',
  },

  // --- Dimensión 2: Ansiedad & Sobrepensamiento ---
  {
    id: 4,
    dimension: 'ansiedad_sobrepensamiento',
    dimensionLabel: 'Ansiedad & Calma',
    dimensionIcon: 'pulse-outline',
    question: '¿Experimentas nerviosismo, inquietud o dificultad para relajarte?',
    subtitle: 'Sensación de aceleración interna o tensión constante en el cuerpo.',
  },
  {
    id: 5,
    dimension: 'ansiedad_sobrepensamiento',
    dimensionLabel: 'Ansiedad & Calma',
    dimensionIcon: 'pulse-outline',
    question: '¿Te descubres sobrepensando situaciones o imaginando los peores escenarios?',
    subtitle: 'Rumiación mental continua sobre cosas pasadas o futuras que te generan angustia.',
  },
  {
    id: 6,
    dimension: 'ansiedad_sobrepensamiento',
    dimensionLabel: 'Ansiedad & Calma',
    dimensionIcon: 'pulse-outline',
    question: '¿Has sentido síntomas físicos de alerta como taquicardia, opresión o respiración rápida?',
    subtitle: 'Respuestas físicas de sobresalto o agobio sin causa médica aparente.',
  },

  // --- Dimensión 3: Estrés & Sobrecarga Emocional ---
  {
    id: 7,
    dimension: 'estres_agotamiento',
    dimensionLabel: 'Estrés & Sobrecarga',
    dimensionIcon: 'flash-outline',
    question: '¿Sientes que las exigencias del día a día sobrepasan tu capacidad de respuesta?',
    subtitle: 'Sensación de estar abrumado/a por responsabilidades, trabajo o problemas personales.',
  },
  {
    id: 8,
    dimension: 'estres_agotamiento',
    dimensionLabel: 'Estrés & Sobrecarga',
    dimensionIcon: 'flash-outline',
    question: '¿Te sientes más irritable, impaciente o sensible ante pequeños inconvenientes?',
    subtitle: 'Reacciones emocionales más intensas de lo habitual frente a situaciones cotidianas.',
  },
  {
    id: 9,
    dimension: 'estres_agotamiento',
    dimensionLabel: 'Estrés & Sobrecarga',
    dimensionIcon: 'flash-outline',
    question: '¿Sientes que no tienes tiempo para desconectar la mente ni un solo momento?',
    subtitle: 'Dificultad para hacer pausas de descanso mental genuino.',
  },

  // --- Dimensión 4: Calidad del Sueño & Energía ---
  {
    id: 10,
    dimension: 'energia_sueno',
    dimensionLabel: 'Sueño & Vitalidad',
    dimensionIcon: 'moon-outline',
    question: '¿Tienes dificultades para conciliar el sueño, te despiertas en la noche o madrugas con angustia?',
    subtitle: 'Alteraciones en tu ritmo de descanso o sueño intranquilo y fragmentado.',
  },
  {
    id: 11,
    dimension: 'energia_sueno',
    dimensionLabel: 'Sueño & Vitalidad',
    dimensionIcon: 'moon-outline',
    question: '¿Te levantas por las mañanas sintiéndote con fatiga física o agotamiento mental?',
    subtitle: 'Sensación de falta de energía y pesadez incluso después de haber dormido.',
  },
  {
    id: 12,
    dimension: 'energia_sueno',
    dimensionLabel: 'Sueño & Vitalidad',
    dimensionIcon: 'moon-outline',
    question: '¿Te cuesta trabajo concentrarte o tomar decisiones sencillas debido al cansancio?',
    subtitle: 'Dificultad de enfoque o mente nublada durante el transcurso del día.',
  },

  // --- Dimensión 5: Autoestima & Vínculos Sociales ---
  {
    id: 13,
    dimension: 'autoestima_social',
    dimensionLabel: 'Autoestima & Vínculos',
    dimensionIcon: 'people-outline',
    question: '¿Te sientes juzgado/a por ti mismo/a o tienes pensamientos de autocrítica severa?',
    subtitle: 'Sentimientos de insuficiencia, culpa excesiva o dudar continuamente de tu valor.',
  },
  {
    id: 14,
    dimension: 'autoestima_social',
    dimensionLabel: 'Autoestima & Vínculos',
    dimensionIcon: 'people-outline',
    question: '¿Tiendes a aislarte o evitar convivir con personas queridas porque te cuesta fingir que estás bien?',
    subtitle: 'Preferencia por estar a solas para no tener que explicar cómo te sientes.',
  },
  {
    id: 15,
    dimension: 'autoestima_social',
    dimensionLabel: 'Autoestima & Vínculos',
    dimensionIcon: 'people-outline',
    question: '¿Sientes que no cuentas con un espacio seguro donde puedas expresarte con total libertad?',
    subtitle: 'Sensación de tener que cargar tus emociones en soledad.',
  },
];

export const calculateTestResult = (answers: Record<number, number>, userId?: string): TestResult => {
  let totalScore = 0;
  const maxPossibleScore = TEST_QUESTIONS.length * 3; // 15 * 3 = 45

  const dimensionTotals: Record<TestDimensionKey, { score: number; count: number; label: string; icon: string }> = {
    animo_depresion: { score: 0, count: 0, label: 'Estado de Ánimo & Vitalidad', icon: 'heart' },
    ansiedad_sobrepensamiento: { score: 0, count: 0, label: 'Ansiedad & Control Mental', icon: 'pulse' },
    estres_agotamiento: { score: 0, count: 0, label: 'Estrés & Sobrecarga', icon: 'flash' },
    energia_sueno: { score: 0, count: 0, label: 'Calidad de Sueño & Descanso', icon: 'moon' },
    autoestima_social: { score: 0, count: 0, label: 'Autoestima & Apoyo Social', icon: 'people' },
  };

  TEST_QUESTIONS.forEach((q) => {
    const val = answers[q.id] !== undefined ? answers[q.id] : 0;
    totalScore += val;
    dimensionTotals[q.dimension].score += val;
    dimensionTotals[q.dimension].count += 1;
  });

  const overallPercentage = Math.round((totalScore / maxPossibleScore) * 100);

  // Compute Dimension Scores
  const dimensions: DimensionScore[] = Object.keys(dimensionTotals).map((key) => {
    const dKey = key as TestDimensionKey;
    const dData = dimensionTotals[dKey];
    const maxDimScore = dData.count * 3;
    const pct = Math.round((dData.score / maxDimScore) * 100);

    let level: 'bajo' | 'moderado' | 'elevado' = 'bajo';
    let insight = '';

    if (pct < 35) {
      level = 'bajo';
      insight = 'Nivel favorable. Mantienes una buena regulación en esta área.';
    } else if (pct < 68) {
      level = 'moderado';
      insight = 'Nivel intermedio. Muestras signos de tensión que requieren atención preventiva.';
    } else {
      level = 'elevado';
      insight = 'Nivel elevado. Esta dimensión requiere cuidado prioritario y apoyo profesional.';
    }

    return {
      key: dKey,
      label: dData.label,
      icon: dData.icon,
      score: dData.score,
      maxScore: maxDimScore,
      percentage: pct,
      level,
      insight,
    };
  });

  // Evaluate Overall Profile
  let levelTitle = '';
  let levelTag: TestResult['levelTag'] = 'equilibrio';
  let badgeColor = '#10B981';
  let badgeTextColor = '#FFFFFF';
  let summary = '';
  let detailedAnalysis = '';
  let suggestedSpecialty = 'Psicología General y Bienestar';
  const recommendations: string[] = [];

  if (totalScore <= 10) {
    levelTitle = 'Equilibrio y Bienestar Emocional Saludable';
    levelTag = 'equilibrio';
    badgeColor = '#10B981';
    summary = 'Tus respuestas reflejan una sólida estabilidad emocional y una buena capacidad para gestionar los retos del día a día.';
    detailedAnalysis = 'Muestras un balance positivo en tu estado de ánimo, descanso y niveles de estrés. Esto no significa ausencia de problemas, sino que cuentas con recursos internos efectivos para afrontarlos.';
    recommendations.push(
      'Continúa fomentando tus hábitos de descanso y actividades que te llenen de energía.',
      'Mantén tu red de comunicación abierta con tus seres queridos.',
      'Sigue practicando la gratitud y la atención a tus emociones cotidianas.'
    );
    suggestedSpecialty = 'Desarrollo Personal y Mindfulness';
  } else if (totalScore <= 20) {
    levelTitle = 'Tensión Emocional y Estrés Leve';
    levelTag = 'estres_leve';
    badgeColor = '#3B82F6';
    summary = 'Se identifican indicios de cansancio acumulado o estrés situacional. Estás manejando la situación, pero tu mente te pide pausas.';
    detailedAnalysis = 'Algunas áreas como el descanso o la tensión cotidiana presentan pequeñas alertas. Es un momento ideal para hacer ajustes preventivos antes de que la carga aumente.';
    recommendations.push(
      'Establece límites claros entre tus horarios de trabajo o estudio y tus momentos de descanso.',
      'Dedica al menos 15 minutos al día a respiración consciente o caminatas sin pantallas.',
      'Usa el espacio de la comunidad para desahogarte cuando sientas que el día fue pesado.'
    );
    suggestedSpecialty = 'Manejo del Estrés y Ansiedad Leve';
  } else if (totalScore <= 31) {
    levelTitle = 'Sobrecarga Emocional y Ansiedad Moderada';
    levelTag = 'ansiedad_moderada';
    badgeColor = '#F59E0B';
    summary = 'Muestras niveles significativos de inquietud, sobrepensamiento o fatiga emocional que están interfiriendo con tu tranquilidad.';
    detailedAnalysis = 'Tus respuestas indican que el sobrepensar y la tensión física o anímica te están consumiendo energía importante. No tienes que acostumbrarte a vivir con esta sobrecarga.';
    recommendations.push(
      'Practica técnicas de grounding (anclaje sensorial) cuando sientas pensamientos en bucle.',
      'Conversa con un psicólogo para adquirir herramientas prácticas contra la rumiación mental.',
      'Evita aislarte; compartir cómo te sientes en un entorno seguro aligera el peso emocional.'
    );
    suggestedSpecialty = 'Psicoterapia Cognitivo-Conductual y Ansiedad';
  } else if (totalScore <= 40) {
    levelTitle = 'Sintomatología Depresiva y Desánimo Significativo';
    levelTag = 'depresion_significativa';
    badgeColor = '#EC4899';
    summary = 'Estás atravesando una etapa emocional compleja marcada por desánimo, tristeza persistente o falta de energía.';
    detailedAnalysis = 'Tus emociones y tu cuerpo están pidiendo auxilio y comprensión. Es completamente natural sentirse así ante momentos difíciles, pero mereces un acompañamiento compasivo y profesional.';
    recommendations.push(
      'Te recomendamos fuertemente agendar una consulta con un psicólogo especializado.',
      'Sé compasivo contigo mismo/a: no te exijas rendir al 100% mientras sanas.',
      'Da pasos muy pequeños hoy: un vaso de agua, una ducha tibia, una frase compartida.'
    );
    suggestedSpecialty = 'Depresión, Duelo y Acompañamiento Emocional';
  } else {
    levelTitle = 'Alerta Emocional Alta / Necesidad de Acompañamiento';
    levelTag = 'alerta_alta';
    badgeColor = '#EF4444';
    summary = 'Estás cargando con un malestar emocional muy intenso y agotador. Recuerda que no tienes que enfrentar esto en soledad.';
    detailedAnalysis = 'Tus niveles de desánimo, ansiedad y desgaste han llegado a un punto donde el apoyo profesional es indispensable para devolverte la calma y la claridad que mereces.';
    recommendations.push(
      'Conéctate de inmediato con alguno de nuestros especialistas en psicología verificados.',
      'Háblale a una persona cercana de confianza y dile con honestidad: "Necesito apoyo hoy".',
      'Si sientes una crisis abrumadora, comunícate con líneas de apoyo emocional gratuitas 24/7.'
    );
    suggestedSpecialty = 'Atención en Crisis y Psicoterapia Clínica Especializada';
  }

  return {
    id: `test_${Date.now()}`,
    userId: userId || 'anonymous',
    createdAt: new Date().toISOString(),
    totalScore,
    maxPossibleScore,
    overallPercentage,
    levelTitle,
    levelTag,
    badgeColor,
    badgeTextColor,
    summary,
    detailedAnalysis,
    dimensions,
    recommendations,
    suggestedSpecialty,
  };
};
