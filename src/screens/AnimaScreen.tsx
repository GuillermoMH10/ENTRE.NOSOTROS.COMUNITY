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
import { getRandomAnimaPhrase } from '../data/animaPhrases';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

interface AnimaScreenProps {
  onOpenMenu: () => void;
  onJoinPress: () => void;
  onProfilePress: () => void;
  onOpenPsychologists?: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

const COMPACT_PROMPTS = [
  { id: '1', emoji: '🌧️', text: 'Tengo ansiedad' },
  { id: '2', emoji: '💬', text: 'Necesito desahogarme' },
  { id: '3', emoji: '🧘‍♂️', text: 'Ejercicio de respiración' },
  { id: '4', emoji: '✨', text: 'Consejo positivo' },
  { id: '5', emoji: '💤', text: 'No puedo dormir' },
  { id: '6', emoji: '🌱', text: 'Me siento triste' },
  { id: '7', emoji: '🎯', text: 'Autoestima' },
  { id: '8', emoji: '💙', text: 'Manejo de estrés' },
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
  const [currentPhrase, setCurrentPhrase] = useState<string>(getRandomAnimaPhrase());

  const flatListRef = useRef<FlatList>(null);

  // Load chat history on mount
  useEffect(() => {
    loadAnimaHistory().then((history) => {
      setMessages(history);
    });
  }, []);

  // Automatically rotate phrase every 10 minutes (600,000 ms) and on every fresh mount
  useEffect(() => {
    setCurrentPhrase(getRandomAnimaPhrase());
    const interval = setInterval(() => {
      setCurrentPhrase(getRandomAnimaPhrase());
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

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

  // Helper to render text with bold tags formatted cleanly (no raw asterisks displayed)
  const renderCleanMessageText = (rawText: string, isUser: boolean) => {
    if (!rawText) return null;
    const segments = rawText.split(/(\*\*.*?\*\*)/g);
    return (
      <Text style={isUser ? styles.userMessageText : styles.modelMessageText}>
        {segments.map((seg, index) => {
          if (seg.startsWith('**') && seg.endsWith('**')) {
            return (
              <Text key={index} style={{ fontWeight: '700' }}>
                {seg.slice(2, -2)}
              </Text>
            );
          }
          return seg;
        })}
      </Text>
    );
  };

  // Render individual chat bubble - Wide, neat layout
  const renderMessageItem = ({ item }: { item: AnimaMessage }) => {
    const isUser = item.role === 'user';
    const isCopied = copiedMessageId === item.id;

    if (isUser) {
      return (
        <View style={styles.userMessageRow}>
          <View style={styles.userBubbleContainer}>
            <View style={styles.userBubble}>
              {renderCleanMessageText(item.text, true)}
            </View>
            <Text style={styles.userMessageTime}>{formatTime(item.timestamp)}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.modelMessageRow}>
        <View style={styles.modelAvatarCol}>
          <AnimaMascot size="xs" variant="profile" animated={false} />
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
                size={13}
                color={isCopied ? '#10B981' : colors.textSecondary}
              />
              {isCopied && <Text style={styles.copiedBadgeText}>Copiado</Text>}
            </TouchableOpacity>
          </View>

          <View style={styles.modelBubble}>
            {renderCleanMessageText(item.text, false)}
          </View>
          <Text style={styles.modelMessageTime}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Fixed Header - Clean, Short, Static & Well-Ordered */}
      <View style={[styles.header, { paddingTop: contentPaddingTop + (Platform.OS === 'ios' ? 6 : 8) }]}>
        <TouchableOpacity
          style={styles.headerMenuBtn}
          onPress={onOpenMenu}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu-outline" size={26} color={colors.coffeeDark} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerMascotRow}>
            <AnimaMascot size="sm" variant="profile" animated={false} />
            <View style={styles.headerTextWrapper}>
              <Text style={styles.headerTitle}>ANIMA</Text>
              <Text style={styles.headerSubtitle}>
                {isGenerating ? 'Escribiendo... 🌱' : 'En línea 💙'}
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
          <Ionicons name="refresh-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Optional Crisis Helpline Banner */}
      {showCrisisHelp && (
        <View style={styles.crisisBanner}>
          <Ionicons name="shield-checkmark" size={17} color="#D97706" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.crisisBannerTitle}>Apoyo profesional disponible</Text>
            <Text style={styles.crisisBannerText}>
              Línea de la Vida: 800 911 2000 (24/7) • Emergencias: 911
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

      {/* Main Chat Area */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 85 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={[
            styles.chatContent,
            { paddingBottom: contentPaddingBottom + 78 },
          ]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.chatHeaderHero}>
              {/* Static Mascot Profile */}
              <AnimaMascot size="lg" variant="profile" animated={false} />
              
              <Text style={styles.heroGreeting}>ANIMA</Text>

              {/* Rotating Short Emotional Phrase Card (Auto-rotates every 10 min or on open) */}
              <View style={styles.phraseCard}>
                <Text style={styles.phraseText}>"{currentPhrase}"</Text>
              </View>

              {/* Compact Suggestions / Quick Prompts Wrapped Grid (No overflow) */}
              <View style={styles.promptsHeaderRow}>
                <Text style={styles.promptsSectionTitle}>Sugerencias rápidas:</Text>
              </View>
              <View style={styles.promptsGrid}>
                {COMPACT_PROMPTS.map((prompt) => (
                  <TouchableOpacity
                    key={prompt.id}
                    style={styles.compactPromptChip}
                    onPress={() => handleSendMessage(prompt.text)}
                    activeOpacity={0.75}
                    disabled={isGenerating}
                  >
                    <Text style={styles.compactPromptEmoji}>{prompt.emoji}</Text>
                    <Text style={styles.compactPromptText}>{prompt.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          ListFooterComponent={
            isGenerating ? (
              <View style={styles.typingIndicatorRow}>
                <AnimaMascot size="xs" variant="profile" animated={false} />
                <View style={styles.typingBubble}>
                  <ActivityIndicator size="small" color={colors.coffeePrimary} style={{ marginRight: 6 }} />
                  <Text style={styles.typingText}>ANIMA está respondiendo... 🌱</Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Bottom Floating Message Input Bar - Clean, Organized & Modern */}
        <View style={[styles.bottomBarContainer, { paddingBottom: contentPaddingBottom + 4 }]}>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              placeholder="Escribe lo que sientes... 💙"
              placeholderTextColor="#7F94A2"
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
              activeOpacity={0.85}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="arrow-up" size={18} color={colors.white} />
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
    paddingBottom: 10,
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
    width: 36,
    height: 36,
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
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: 0.4,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.coffeePrimary,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
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
    paddingVertical: 8,
  },
  crisisBannerTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#92400E',
  },
  crisisBannerText: {
    fontSize: 10.5,
    color: '#B45309',
    marginTop: 1,
  },
  crisisBannerBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    marginLeft: 8,
  },
  crisisBannerBtnText: {
    color: colors.white,
    fontSize: 10.5,
    fontWeight: '700',
  },
  /* Chat Content List */
  chatContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  /* Hero section with short phrase */
  chatHeaderHero: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 14,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  heroGreeting: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.coffeeDark,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  phraseCard: {
    backgroundColor: '#F0F6F9',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E1EAEF',
    alignItems: 'center',
    width: '100%',
  },
  phraseText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#244558',
    textAlign: 'center',
    lineHeight: 18,
  },
  /* Compact Suggestions Wrapped Grid (Fits cleanly inside card) */
  promptsHeaderRow: {
    width: '100%',
    marginBottom: 6,
  },
  promptsSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  promptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },
  compactPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F8FA',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1EAEF',
  },
  compactPromptEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  compactPromptText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2A4D62',
  },
  /* Message Bubble - User */
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
    paddingLeft: 36,
  },
  userBubbleContainer: {
    alignItems: 'flex-end',
    maxWidth: '88%',
  },
  userBubble: {
    backgroundColor: colors.coffeePrimary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    borderBottomRightRadius: 3,
    shadowColor: colors.coffeePrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  userMessageText: {
    color: colors.white,
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  userMessageTime: {
    fontSize: 9.5,
    color: colors.textSecondary,
    marginTop: 2,
    marginRight: 4,
  },
  /* Message Bubble - Model (Wider, neat layout) */
  modelMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    width: '100%',
  },
  modelAvatarCol: {
    marginRight: 8,
    marginTop: 3,
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
    marginBottom: 3,
    paddingHorizontal: 2,
  },
  modelSenderName: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.coffeePrimary,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  copiedBadgeText: {
    fontSize: 9.5,
    color: '#10B981',
    fontWeight: '700',
  },
  modelBubble: {
    width: '100%',
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderTopLeftRadius: 3,
    borderWidth: 1.2,
    borderColor: '#E1EAEF',
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  modelMessageText: {
    color: '#1F3847',
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '400',
  },
  modelMessageTime: {
    fontSize: 9.5,
    color: colors.textSecondary,
    marginTop: 2,
    marginLeft: 4,
  },
  /* Typing Indicator */
  typingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingLeft: 2,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F6F9',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E1EAEF',
  },
  typingText: {
    fontSize: 11.5,
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
    paddingTop: 6,
    backgroundColor: 'rgba(248, 250, 252, 0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: '#CBD9E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: colors.coffeeDark,
    maxHeight: 90,
    minHeight: 34,
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 6,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.coffeePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    shadowColor: colors.coffeePrimary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#B5C8D4',
    shadowOpacity: 0,
  },
});
