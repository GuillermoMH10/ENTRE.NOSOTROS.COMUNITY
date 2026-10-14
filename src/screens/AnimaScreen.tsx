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
  Image,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimaMascot } from '../components/Anima/AnimaMascot';
import { AnimaVideoSplash } from '../components/Anima/AnimaVideoSplash';
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
  hideAppHeader?: boolean;
  onKeyboardStateChange?: (isOpen: boolean) => void;
}

let hasShownAnimaSplashInSession = false;

const COMPACT_PROMPTS = [
  { id: '1', emoji: '🌧️', text: 'Tengo ansiedad' },
  { id: '2', emoji: '💬', text: 'Necesito hablar' },
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
  hideAppHeader = false,
  onKeyboardStateChange,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AnimaMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showCrisisHelp, setShowCrisisHelp] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState<string>(getRandomAnimaPhrase());
  const [showSplash, setShowSplash] = useState(() => {
    if (Platform.OS === 'web' && hasShownAnimaSplashInSession) {
      return false;
    }
    return true;
  });

  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && windowWidth >= 1024;
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const handleInputFocus = () => {
    setIsKeyboardOpen(true);
    onKeyboardStateChange?.(true);
    setTimeout(() => scrollToBottom(true), 150);
  };

  const handleInputBlur = () => {
    setIsKeyboardOpen(false);
    onKeyboardStateChange?.(false);
  };

  // Track software keyboard on iOS, Android and mobile browsers
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardOpen(true);
      onKeyboardStateChange?.(true);
      setTimeout(() => scrollToBottom(true), 100);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardOpen(false);
      onKeyboardStateChange?.(false);
    });

    let cleanupViewport: (() => void) | undefined;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.visualViewport) {
      const handleResize = () => {
        const isOpen = window.visualViewport
          ? window.visualViewport.height < window.innerHeight - 120
          : false;
        setIsKeyboardOpen(isOpen);
        onKeyboardStateChange?.(isOpen);
        if (isOpen) {
          setTimeout(() => scrollToBottom(true), 120);
        }
      };
      window.visualViewport.addEventListener('resize', handleResize);
      cleanupViewport = () => window.visualViewport?.removeEventListener('resize', handleResize);
    }

    return () => {
      showSub.remove();
      hideSub.remove();
      if (cleanupViewport) cleanupViewport();
    };
  }, [onKeyboardStateChange]);

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

  // Scroll to bottom whenever messages change or generation state updates
  const scrollToBottom = (animated: boolean = true) => {
    try {
      flatListRef.current?.scrollToEnd({ animated });
    } catch (e) {}

    if (Platform.OS === 'web') {
      setTimeout(() => {
        try {
          flatListRef.current?.scrollToEnd?.({ animated });
          const node = (flatListRef.current as any)?.getScrollableNode?.();
          if (node) {
            node.scrollTop = node.scrollHeight;
          }
        } catch (e) {}
      }, 50);
      setTimeout(() => {
        try {
          const node = (flatListRef.current as any)?.getScrollableNode?.();
          if (node) {
            node.scrollTop = node.scrollHeight;
          }
        } catch (e) {}
      }, 160);
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, isGenerating]);

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

  const handleSplashFinish = () => {
    hasShownAnimaSplashInSession = true;
    setShowSplash(false);
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        !isDesktop && !isKeyboardOpen && { paddingBottom: contentPaddingBottom },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? (hideAppHeader ? 0 : 56) : 0}
    >
      {/* Centered Video Splash on Screen Open */}
      {showSplash && (
        <AnimaVideoSplash onFinish={handleSplashFinish} />
      )}

      {/* Desktop Header or Mobile Header */}
      {hideAppHeader ? (
        <View style={styles.desktopChatHeader}>
          <View style={styles.desktopHeaderLeft}>
            <View style={styles.avatarRingSmall}>
              <AnimaMascot size="xs" variant="profile" animated={false} />
              <View style={styles.onlineStatusDot} />
            </View>
            <View style={styles.desktopHeaderTextWrap}>
              <View style={styles.desktopTitleRow}>
                <Text style={styles.desktopHeaderTitle}>ANIMA</Text>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>IA</Text>
                </View>
              </View>
              <Text style={styles.desktopHeaderSubtitle}>Tu compañera de bienestar emocional • En línea</Text>
            </View>
          </View>

          <View style={styles.desktopHeaderRight}>
            <TouchableOpacity
              style={styles.desktopRestartBtn}
              onPress={handleClearHistory}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Reiniciar conversación"
            >
              <Ionicons name="refresh-outline" size={16} color={colors.coffeeDark} />
              <Text style={styles.desktopRestartText}>Reiniciar chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Top Fixed Header with Profile on Left, Logo centered, and Restart Chat on Right */
        <View style={[styles.header, { paddingTop: contentPaddingTop + (Platform.OS === 'ios' ? 6 : 8) }]}>
          {/* Left: User Profile Avatar or Unirse Button */}
          <View style={styles.headerLeftAction}>
            {user ? (
              <TouchableOpacity
                style={styles.profileAvatarButton}
                onPress={onProfilePress}
                activeOpacity={0.8}
                accessibilityLabel="Ver mi perfil"
              >
                <View style={styles.avatarRing}>
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.userAvatarImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.profileBadge}>
                  <Ionicons name="person" size={8} color={colors.white} />
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={onJoinPress}
                activeOpacity={0.85}
                accessibilityLabel="Unirse"
              >
                <Text style={styles.joinButtonText}>Unirse</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Center: App Logo */}
          <View style={styles.headerCenter} pointerEvents="none">
            <Image
              source={require('../../assets/logoappE.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Logo Entre Nosotros"
            />
          </View>

          {/* Right: Restart Chat Button */}
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={handleClearHistory}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Reiniciar conversación"
            >
              <Ionicons name="refresh-outline" size={22} color={colors.coffeeDark} />
            </TouchableOpacity>
          </View>
        </View>
      )}

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
      <View style={styles.chatAreaWrapper}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          style={styles.chatList}
          contentContainerStyle={[
            styles.chatContent,
            { paddingBottom: 16 },
          ]}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() => scrollToBottom(false)}
          onLayout={() => scrollToBottom(false)}
          ListHeaderComponent={
            messages.length <= 1 ? (
              <View style={styles.chatHeaderHero}>
                {/* Static Mascot Profile */}
                <AnimaMascot size="lg" variant="profile" animated={false} />
                
                <Text style={styles.heroGreeting}>ANIMA</Text>

                {/* Rotating Short Emotional Phrase Card */}
                <View style={styles.phraseCard}>
                  <Text style={styles.phraseText}>"{currentPhrase}"</Text>
                </View>

                {/* Compact Suggestions / Quick Prompts Wrapped Grid */}
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
            ) : (
              <View style={styles.compactHeroCard}>
                <View style={styles.compactHeroRow}>
                  <AnimaMascot size="xs" variant="profile" animated={false} />
                  <Text style={styles.compactHeroText} numberOfLines={2}>
                    "{currentPhrase}"
                  </Text>
                </View>
              </View>
            )
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

        {/* Message Input Bar */}
        <View style={styles.bottomBarContainer}>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textInput}
              placeholder={
                Platform.OS === 'web' && isDesktop
                  ? 'Escribe lo que sientes... 💙 (Enter para enviar)'
                  : 'Escribe lo que sientes... 💙'
              }
              placeholderTextColor="#7F94A2"
              value={inputText}
              onChangeText={setInputText}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              multiline
              maxLength={1500}
              editable={!isGenerating}
              onKeyPress={(e: any) => {
                if (Platform.OS === 'web' && isDesktop && e.nativeEvent?.key === 'Enter' && !e.nativeEvent?.shiftKey) {
                  e.preventDefault?.();
                  handleSendMessage();
                }
              }}
              onSubmitEditing={() => {
                if (Platform.OS === 'web' && isDesktop) {
                  handleSendMessage();
                }
              }}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isGenerating) && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isGenerating}
              activeOpacity={0.85}
              accessibilityLabel="Enviar mensaje"
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="arrow-up" size={18} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web'
      ? ({
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        } as any)
      : {}),
  },
  chatAreaWrapper: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  chatList: {
    flex: 1,
    width: '100%',
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
    paddingTop: Platform.OS === 'ios' ? 6 : 8,
    paddingBottom: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
    height: 56,
  },
  headerLeftAction: {
    zIndex: 2,
    minWidth: 38,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerCenter: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 170,
    height: 42,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 2,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarButton: {
    position: 'relative',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.8,
    borderColor: colors.coffeePrimary,
    padding: 1.5,
    backgroundColor: colors.white,
  },
  userAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    backgroundColor: colors.surface,
  },
  profileBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.coffeePrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  joinButton: {
    backgroundColor: colors.coffeePrimary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '700',
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
  /* Desktop ANIMA Header */
  desktopChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E1EAEF',
    zIndex: 10,
  },
  desktopHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarRingSmall: {
    position: 'relative',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  desktopHeaderTextWrap: {
    flexDirection: 'column',
  },
  desktopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  desktopHeaderTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.coffeeDark,
    letterSpacing: 0.3,
  },
  aiBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
  },
  desktopHeaderSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  desktopHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  desktopRestartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  desktopRestartText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.coffeeDark,
  },
  /* Compact Hero for ongoing chats */
  compactHeroCard: {
    backgroundColor: '#F0F6F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1EAEF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 10,
    marginTop: 4,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 720,
  },
  compactHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactHeroText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '600',
    color: '#244558',
    fontStyle: 'italic',
  },
  /* Chat Content List */
  chatContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    width: '100%',
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
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
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
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
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
    maxWidth: 720,
    alignSelf: 'center',
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
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
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
    position: 'relative',
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
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
