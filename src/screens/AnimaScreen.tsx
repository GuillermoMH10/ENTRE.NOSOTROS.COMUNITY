import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimaMascot } from '../components/Anima/AnimaMascot';
import {
  AnimaMessage,
  loadAnimaHistory,
  saveAnimaHistory,
  clearAnimaHistory,
  sendAnimaMessage,
} from '../services/animaService';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface AnimaScreenProps {
  onOpenMenu: () => void;
  onJoinPress: () => void;
  onProfilePress: () => void;
  onOpenPsychologists?: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

const QUICK_PROMPTS = [
  { id: '1', emoji: '🌧️', text: 'Siento mucha ansiedad hoy y no sé qué hacer' },
  { id: '2', emoji: '💬', text: 'Solo necesito desahogarme de un mal día' },
  { id: '3', emoji: '🧘‍♂️', text: 'Guíame en un ejercicio de respiración para calmarme' },
  { id: '4', emoji: '✨', text: 'Dame un pensamiento positivo o frase reconfortante' },
  { id: '5', emoji: '💤', text: 'Tengo insomnio y estrés, ¿qué me recomiendas?' },
  { id: '6', emoji: '🌱', text: 'Me siento triste y con baja autoestima' },
];

export const AnimaScreen: React.FC<AnimaScreenProps> = ({
  onOpenMenu,
  onJoinPress,
  onProfilePress,
  onOpenPsychologists,
  contentPaddingTop = 0,
  contentPaddingBottom = 70,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AnimaMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showCrisisHelp, setShowCrisisHelp] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const typingDotsAnim = useRef(new Animated.Value(0)).current;

  // Load chat history on mount
  useEffect(() => {
    loadAnimaHistory().then((history) => {
      setMessages(history);
    });
  }, []);

  // Typing dots animation
  useEffect(() => {
    if (isGenerating) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(typingDotsAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingDotsAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isGenerating]);

  // Scroll to bottom whenever messages change
  const scrollToBottom = (animated: boolean = true) => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated });
    }, 100);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isGenerating) return;

    setInputText('');

    const userMessage: AnimaMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    saveAnimaHistory(newHistory);
    scrollToBottom(true);
    setIsGenerating(true);

    // Crisis keyword hint trigger
    const lower = text.toLowerCase();
    if (
      lower.includes('suicid') ||
      lower.includes('matar') ||
      lower.includes('morir') ||
      lower.includes('hacerme daño') ||
      lower.includes('no quiero vivir')
    ) {
      setShowCrisisHelp(true);
    }

    try {
      const aiReply = await sendAnimaMessage(newHistory, text);

      const modelMessage: AnimaMessage = {
        id: `msg_model_${Date.now()}`,
        role: 'model',
        text: aiReply,
        timestamp: Date.now(),
      };

      const updatedHistory = [...newHistory, modelMessage];
      setMessages(updatedHistory);
      saveAnimaHistory(updatedHistory);
      scrollToBottom(true);
    } catch (error: any) {
      const errorMessage: AnimaMessage = {
        id: `msg_error_${Date.now()}`,
        role: 'model',
        text: 'Lo siento, hubo una pequeña desconexión 🌧️. Pero aquí sigo contigo. ¿Podrías intentar enviarlo de nuevo? 💙',
        timestamp: Date.now(),
      };
      const updatedHistory = [...newHistory, errorMessage];
      setMessages(updatedHistory);
      saveAnimaHistory(updatedHistory);
      scrollToBottom(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClearHistory = () => {
    const doClear = async () => {
      const freshHistory = await clearAnimaHistory();
      setMessages(freshHistory);
      setShowCrisisHelp(false);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Deseas reiniciar la conversación con ANIMA?')) {
        doClear();
      }
    } else {
      Alert.alert(
        'Reiniciar conversación',
        '¿Deseas borrar los mensajes actuales y empezar una conversación nueva con ANIMA?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reiniciar', style: 'destructive', onPress: doClear },
        ]
      );
    }
  };

  const handleCopyMessage = (msg: AnimaMessage) => {
    try {
      Clipboard.setString(msg.text);
      setCopiedMessageId(msg.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
  };

  // Render individual chat bubble
  const renderMessageItem = ({ item }: { item: AnimaMessage }) => {
    const isUser = item.role === 'user';
    const isCopied = copiedMessageId === item.id;

    if (isUser) {
      return (
        <View style={styles.userMessageRow}>
          <View style={styles.userBubbleContainer}>
            <View style={styles.userBubble}>
              <Text style={styles.userMessageText}>{item.text}</Text>
            </View>
            <Text style={styles.userMessageTime}>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.modelMessageRow}>
        <View style={styles.modelAvatarCol}>
          <AnimaMascot size="xs" animated={false} />
        </View>
        <View style={styles.modelBubbleContainer}>
          <View style={styles.modelBubbleHeader}>
            <Text style={styles.modelSenderName}>ANIMA 💙</Text>
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() => handleCopyMessage(item)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isCopied ? 'checkmark-circle' : 'copy-outline'}
                size={14}
                color={isCopied ? '#10B981' : colors.textSecondary}
              />
              {isCopied && <Text style={styles.copiedBadgeText}>Copiado</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.modelBubble}>
            <Text style={styles.modelMessageText}>{item.text}</Text>
          </View>
          <Text style={styles.modelMessageTime}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Fixed Header */}
      <View style={[styles.header, { paddingTop: contentPaddingTop + (Platform.OS === 'ios' ? 8 : 10) }]}>
        <TouchableOpacity
          style={styles.headerMenuBtn}
          onPress={onOpenMenu}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu-outline" size={28} color={colors.coffeeDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerMascotRow}>
            <AnimaMascot size="sm" isThinking={isGenerating} />
            <View style={styles.headerTextWrapper}>
              <Text style={styles.headerTitle}>ANIMA</Text>
              <Text style={styles.headerSubtitle}>
                {isGenerating ? 'Pensando con cariño... 🌱' : 'Acompañante Emocional 💙'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={handleClearHistory}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Reiniciar conversación"
        >
          <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Optional Crisis Helpline Banner */}
      {showCrisisHelp && (
        <View style={styles.crisisBanner}>
          <Ionicons name="shield-checkmark" size={18} color="#D97706" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.crisisBannerTitle}>Apoyo profesional inmediato</Text>
            <Text style={styles.crisisBannerText}>
              Línea de la Vida: 800 911 2000 (24/7 gratuito) • Emergencias: 911
            </Text>
          </View>
          {onOpenPsychologists && (
            <TouchableOpacity
              style={styles.crisisBannerBtn}
              onPress={onOpenPsychologists}
              activeOpacity={0.8}
            >
              <Text style={styles.crisisBannerBtnText}>Ver psicólogos</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Main Conversation List */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={[
            styles.chatContent,
            { paddingBottom: contentPaddingBottom + 90 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.chatHeaderHero}>
              <AnimaMascot size="lg" isThinking={isGenerating} />
              <Text style={styles.heroGreeting}>¡Hola, soy ANIMA!</Text>
              <Text style={styles.heroDesc}>
                Tu espacio seguro de escucha empática, calma y orientación emocional. ¿Cómo te sientes hoy?
              </Text>

              {/* Quick Prompts Carousel/Pills */}
              <Text style={styles.promptsSectionTitle}>Sugerencias rápidas para comenzar:</Text>
              <View style={styles.promptsGrid}>
                {QUICK_PROMPTS.map((prompt) => (
                  <TouchableOpacity
                    key={prompt.id}
                    style={styles.promptChip}
                    onPress={() => handleSendMessage(prompt.text)}
                    activeOpacity={0.8}
                    disabled={isGenerating}
                  >
                    <Text style={styles.promptChipEmoji}>{prompt.emoji}</Text>
                    <Text style={styles.promptChipText}>{prompt.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          ListFooterComponent={
            isGenerating ? (
              <View style={styles.typingIndicatorRow}>
                <AnimaMascot size="xs" isThinking={true} />
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={colors.coffeePrimary} style={{ marginRight: 6 }} />
                  <Text style={styles.typingText}>ANIMA está respondiendo con cariño...</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Bottom Floating Message Input Bar */}
        <View style={[styles.bottomBarContainer, { paddingBottom: contentPaddingBottom + 6 }]}>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              placeholder="Cuéntame cómo te sientes... 💙"
              placeholderTextColor="#8A9CA8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1500}
              editable={!isGenerating}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isGenerating) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isGenerating}
              activeOpacity={0.8}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="arrow-up" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  /* Top Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  headerMenuBtn: {
    width: 38,
    height: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTextWrapper: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.coffeePrimary,
  },
  headerActionBtn: {
    width: 38,
    height: 38,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  /* Crisis Help Banner */
  crisisBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  crisisBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  crisisBannerText: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  crisisBannerBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  crisisBannerBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  /* Chat Content */
  chatContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  chatHeaderHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  heroGreeting: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.coffeeDark,
    marginTop: 10,
  },
  heroDesc: {
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 320,
  },
  promptsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.coffeePrimary,
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  promptsGrid: {
    width: '100%',
    gap: 6,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F6F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1EAEF',
  },
  promptChipEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  promptChipText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#2A4D62',
    lineHeight: 16,
  },
  /* Message Bubble - User */
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 14,
    paddingLeft: 40,
  },
  userBubbleContainer: {
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: colors.coffeePrimary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    shadowColor: colors.coffeePrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessageText: {
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  userMessageTime: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 3,
    marginRight: 4,
  },
  /* Message Bubble - Model */
  modelMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 32,
  },
  modelAvatarCol: {
    marginRight: 8,
    marginTop: 4,
  },
  modelBubbleContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  modelBubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  modelSenderName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.coffeePrimary,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  copiedBadgeText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
  },
  modelBubble: {
    backgroundColor: colors.white,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
    borderTopLeftRadius: 4,
    borderWidth: 1.2,
    borderColor: '#E1EAEF',
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  modelMessageText: {
    color: '#1F3847',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  modelMessageTime: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 3,
    marginLeft: 4,
  },
  /* Typing Indicator */
  typingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingLeft: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F6F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E1EAEF',
  },
  typingText: {
    fontSize: 12,
    color: colors.coffeePrimary,
    fontWeight: '600',
  },
  /* Bottom Floating Input Bar */
  bottomBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: 'rgba(248, 250, 252, 0.95)',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#CCDCE6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: colors.coffeeDark,
    maxHeight: 100,
    minHeight: 36,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.coffeePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    shadowColor: colors.coffeePrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#B5C8D4',
    shadowOpacity: 0,
  },
});
