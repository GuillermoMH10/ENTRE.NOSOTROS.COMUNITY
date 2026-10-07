import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Psychologist } from '../types/psychologist';
import { subscribeToPsychologists } from '../services/psychologistsService';
import { PsychologistDetailModal } from '../components/Psychologists/PsychologistDetailModal';
import { AppHeader } from '../components/Header/AppHeader';
import { colors } from '../theme/colors';

interface PsychologistsScreenProps {
  onOpenMenu: () => void;
  onJoinPress: () => void;
  onProfilePress: () => void;
  contentPaddingTop?: number;
  contentPaddingBottom?: number;
}

type ModalidadFilter = 'todos' | 'linea' | 'presencial';

export const PsychologistsScreen: React.FC<PsychologistsScreenProps> = ({
  onOpenMenu,
  onJoinPress,
  onProfilePress,
  contentPaddingTop = 0,
  contentPaddingBottom = 80,
}) => {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPsico, setSelectedPsico] = useState<Psychologist | null>(null);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [modalidadFilter, setModalidadFilter] = useState<ModalidadFilter>('todos');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPsychologists((data) => {
      setPsychologists(data);
      setIsLoading(false);
      setRefreshing(false);
    });

    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Extract unique topics dynamically ONLY from registered psychologists
  const dynamicTopics = useMemo(() => {
    const topicSet = new Set<string>();
    psychologists.forEach((p) => {
      if (Array.isArray(p.temas)) {
        p.temas.forEach((tema) => {
          const trimmed = tema?.trim();
          if (trimmed) topicSet.add(trimmed);
        });
      }
    });
    return Array.from(topicSet);
  }, [psychologists]);

  // Filtered list based on search, modality, and dynamic topic
  const filteredPsychologists = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return psychologists.filter((p) => {
      // 1. Search Query Filter
      if (query) {
        const nameMatch = p.nombre?.toLowerCase().includes(query);
        const specMatch = p.especialidad?.toLowerCase().includes(query);
        const cityMatch = p.ciudad?.toLowerCase().includes(query);
        const descMatch = p.descripcion?.toLowerCase().includes(query);
        const topicMatch = (p.temas || []).some((t) => t.toLowerCase().includes(query));

        if (!nameMatch && !specMatch && !cityMatch && !descMatch && !topicMatch) {
          return false;
        }
      }

      // 2. Modality Filter
      if (modalidadFilter !== 'todos') {
        const mod = (p.modalidad || '').toLowerCase();
        if (modalidadFilter === 'linea') {
          const isOnline =
            mod.includes('línea') ||
            mod.includes('linea') ||
            mod.includes('ambos') ||
            mod.includes('ambas');
          if (!isOnline) return false;
        } else if (modalidadFilter === 'presencial') {
          const isPresential =
            mod.includes('presencial') ||
            mod.includes('ambos') ||
            mod.includes('ambas');
          if (!isPresential) return false;
        }
      }

      // 3. Topic Filter
      if (selectedTopic) {
        const hasTopic = (p.temas || []).some(
          (t) => t.trim().toLowerCase() === selectedTopic.trim().toLowerCase()
        );
        if (!hasTopic) return false;
      }

      return true;
    });
  }, [psychologists, searchQuery, modalidadFilter, selectedTopic]);

  const handleOpenWhatsApp = (whatsapp?: string, name?: string) => {
    if (!whatsapp) {
      Alert.alert('Contacto', 'Este especialista no tiene registrado un número de WhatsApp.');
      return;
    }
    const cleanNumber = whatsapp.replace(/[^\d]/g, '');
    const message = encodeURIComponent(
      `Hola ${name || 'Especialista'}, te contacto desde la aplicación Entre Nosotros. Me gustaría solicitar informes para una consulta.`
    );
    const url = `https://wa.me/${cleanNumber}?text=${message}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('WhatsApp', `No se pudo abrir WhatsApp: ${whatsapp}`);
    });
  };

  const handleOpenEmail = (correo?: string, name?: string) => {
    if (!correo) {
      Alert.alert('Contacto', 'Este especialista no tiene registrado un correo electrónico.');
      return;
    }
    const subject = encodeURIComponent('Consulta Psicológica - Entre Nosotros');
    const body = encodeURIComponent(
      `Hola ${name || 'Especialista'},\n\nTe contacto a través de la aplicación Entre Nosotros para solicitar información sobre tus consultas.\n\nSaludos.`
    );
    Linking.openURL(`mailto:${correo}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Correo', correo);
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setModalidadFilter('todos');
    setSelectedTopic(null);
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 || modalidadFilter !== 'todos' || selectedTopic !== null;

  const renderItem = ({ item }: { item: Psychologist }) => {
    const topicsToShow = (item.temas || []).slice(0, 3);
    const remainingTopicsCount = (item.temas || []).length - 3;

    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardTopContent}>
          {/* Left Column: Circular Avatar with verified badge */}
          <TouchableOpacity
            style={styles.avatarLeftCol}
            activeOpacity={0.88}
            onPress={() => setSelectedPsico(item)}
          >
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: item.imagen }} style={styles.avatarImage} resizeMode="cover" />
              <View style={styles.avatarVerifiedBadge}>
                <Ionicons name="checkmark" size={12} color={colors.white} />
              </View>
            </View>

            {/* Modalidad Badge under avatar */}
            <View style={styles.modalidadPill}>
              <Ionicons
                name={
                  item.modalidad?.includes('línea') || item.modalidad?.includes('Línea')
                    ? 'videocam-outline'
                    : 'business-outline'
                }
                size={10}
                color={colors.coffeePrimary}
              />
              <Text style={styles.modalidadPillText} numberOfLines={1}>
                {item.modalidad || 'Presencial/Línea'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Right Column: Name, City, Specialty, Topics */}
          <TouchableOpacity
            style={styles.infoRightCol}
            activeOpacity={0.88}
            onPress={() => setSelectedPsico(item)}
          >
            {/* Name with Verified Checkmark */}
            <View style={styles.nameRow}>
              <Text style={styles.nameText} numberOfLines={1}>
                {item.nombre}
              </Text>
              <Ionicons name="checkmark-circle" size={16} color="#2563EB" style={{ marginLeft: 4 }} />
            </View>

            {/* Ciudad (City in very small font right below the name) */}
            {item.ciudad ? (
              <View style={styles.cityRow}>
                <Ionicons name="location-sharp" size={11} color={colors.coffeePrimary} style={{ marginRight: 3 }} />
                <Text style={styles.cityText} numberOfLines={1}>
                  {item.ciudad}
                </Text>
              </View>
            ) : null}

            {/* Specialty */}
            <Text style={styles.specialtyText} numberOfLines={2}>
              {item.especialidad}
            </Text>

            {/* Topics (Max 3 + Counter) */}
            {topicsToShow.length > 0 ? (
              <View style={styles.topicsRow}>
                {topicsToShow.map((tema, idx) => (
                  <View key={idx} style={styles.topicChip}>
                    <Text style={styles.topicChipText} numberOfLines={1}>
                      {tema}
                    </Text>
                  </View>
                ))}
                {remainingTopicsCount > 0 && (
                  <View style={styles.remainingTopicChip}>
                    <Text style={styles.remainingTopicText}>+{remainingTopicsCount}</Text>
                  </View>
                )}
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* Bottom Actions Row: WhatsApp, Email, Ver Perfil */}
        <View style={styles.cardActionsRow}>
          {/* WhatsApp Button */}
          <TouchableOpacity
            style={styles.whatsappBtn}
            activeOpacity={0.85}
            onPress={() => handleOpenWhatsApp(item.whatsapp || item.telefono, item.nombre)}
          >
            <Ionicons name="logo-whatsapp" size={16} color={colors.white} />
            <Text style={styles.whatsappBtnText}>WhatsApp</Text>
          </TouchableOpacity>

          {/* Email Button */}
          <TouchableOpacity
            style={styles.emailBtn}
            activeOpacity={0.85}
            onPress={() => handleOpenEmail(item.correo, item.nombre)}
          >
            <Ionicons name="mail" size={15} color="#EA4335" />
            <Text style={styles.emailBtnText}>Correo</Text>
          </TouchableOpacity>

          {/* View Profile Button */}
          <TouchableOpacity
            style={styles.viewProfileBtn}
            activeOpacity={0.85}
            onPress={() => setSelectedPsico(item)}
          >
            <Text style={styles.viewProfileBtnText}>Ver perfil</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      <AppHeader
        onOpenMenu={onOpenMenu}
        onJoinPress={onJoinPress}
        onProfilePress={onProfilePress}
      />

      {/* Fixed Header, Search & Filter Section (Keeps TextInput from losing focus) */}
      <View style={[styles.headerContainer, { paddingTop: contentPaddingTop + 4 }]}>
        {/* Centered "¿Necesitas ayuda?" */}
        <View style={styles.headerTitleRow}>
          <Ionicons name="sparkles" size={17} color={colors.coffeePrimary} style={{ marginRight: 6 }} />
          <Text style={styles.screenMainTitle}>¿Necesitas ayuda?</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={18} color={colors.coffeePrimary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, tema, ciudad..."
            placeholderTextColor="#A89B91"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#A89B91" />
            </TouchableOpacity>
          )}
        </View>

        {/* Modality Filter Tabs */}
        <View style={styles.modalityFilterRow}>
          <TouchableOpacity
            style={[
              styles.modalityFilterBtn,
              modalidadFilter === 'todos' && styles.modalityFilterBtnActive,
            ]}
            onPress={() => setModalidadFilter('todos')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="apps-outline"
              size={13}
              color={modalidadFilter === 'todos' ? colors.white : colors.coffeeDark}
            />
            <Text
              style={[
                styles.modalityFilterBtnText,
                modalidadFilter === 'todos' && styles.modalityFilterBtnTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modalityFilterBtn,
              modalidadFilter === 'linea' && styles.modalityFilterBtnActive,
            ]}
            onPress={() => setModalidadFilter(modalidadFilter === 'linea' ? 'todos' : 'linea')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="videocam-outline"
              size={13}
              color={modalidadFilter === 'linea' ? colors.white : colors.coffeeDark}
            />
            <Text
              style={[
                styles.modalityFilterBtnText,
                modalidadFilter === 'linea' && styles.modalityFilterBtnTextActive,
              ]}
            >
              En línea
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modalityFilterBtn,
              modalidadFilter === 'presencial' && styles.modalityFilterBtnActive,
            ]}
            onPress={() =>
              setModalidadFilter(modalidadFilter === 'presencial' ? 'todos' : 'presencial')
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="business-outline"
              size={13}
              color={modalidadFilter === 'presencial' ? colors.white : colors.coffeeDark}
            />
            <Text
              style={[
                styles.modalityFilterBtnText,
                modalidadFilter === 'presencial' && styles.modalityFilterBtnTextActive,
              ]}
            >
              Presencial
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Topics Filter */}
        {dynamicTopics.length > 0 && (
          <View style={styles.topicsFilterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topicsScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {dynamicTopics.map((topic, index) => {
                const isSelected =
                  selectedTopic?.toLowerCase() === topic.toLowerCase();
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.topicFilterChip,
                      isSelected && styles.topicFilterChipActive,
                    ]}
                    onPress={() =>
                      setSelectedTopic(isSelected ? null : topic)
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'pricetag-outline'}
                      size={12}
                      color={isSelected ? colors.white : colors.coffeePrimary}
                    />
                    <Text
                      style={[
                        styles.topicFilterChipText,
                        isSelected && styles.topicFilterChipTextActive,
                      ]}
                    >
                      {topic}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Active Filter Notice & Reset */}
        {hasActiveFilters && (
          <View style={styles.activeFilterNotice}>
            <Text style={styles.activeFilterCount}>
              {filteredPsychologists.length}{' '}
              {filteredPsychologists.length === 1 ? 'especialista encontrado' : 'especialistas encontrados'}
            </Text>
            <TouchableOpacity
              onPress={handleClearFilters}
              style={styles.clearFiltersBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="reload-outline" size={12} color={colors.coffeePrimary} />
              <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Psychologists List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.coffeePrimary} />
        </View>
      ) : (
        <FlatList
          data={filteredPsychologists}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: 6,
              paddingBottom: contentPaddingBottom + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.coffeePrimary}
              colors={[colors.coffeePrimary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyCard}>
              <Ionicons
                name={hasActiveFilters ? 'search-outline' : 'people-outline'}
                size={42}
                color={colors.coffeePrimary}
              />
              <Text style={styles.emptyTitle}>
                {hasActiveFilters
                  ? 'No se encontraron resultados'
                  : 'Próximamente especialistas'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {hasActiveFilters
                  ? 'Intenta ajustar los filtros de búsqueda o seleccionar otros temas.'
                  : 'Estamos integrando a los mejores profesionales en psicología para brindarte el apoyo que necesitas.'}
              </Text>
              {hasActiveFilters && (
                <TouchableOpacity
                  onPress={handleClearFilters}
                  style={styles.emptyResetBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyResetBtnText}>Restablecer filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Full Psychologist Profile Modal */}
      <PsychologistDetailModal
        visible={selectedPsico !== null}
        psychologist={selectedPsico}
        onClose={() => setSelectedPsico(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  /* Header Container */
  headerContainer: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  screenMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.coffeeDark,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  /* Search Bar */
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.coffeeDark,
    paddingVertical: 0,
  },
  /* Modality Filters */
  modalityFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  modalityFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 5,
  },
  modalityFilterBtnActive: {
    backgroundColor: colors.coffeePrimary,
    borderColor: colors.coffeePrimary,
  },
  modalityFilterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.coffeeDark,
  },
  modalityFilterBtnTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  /* Dynamic Topic Filters */
  topicsFilterWrapper: {
    marginBottom: 6,
  },
  topicsScrollContent: {
    gap: 6,
    paddingRight: 8,
  },
  topicFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EAE3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5D5C8',
    gap: 4,
  },
  topicFilterChipActive: {
    backgroundColor: colors.coffeePrimary,
    borderColor: colors.coffeePrimary,
  },
  topicFilterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.coffeeDark,
  },
  topicFilterChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  /* Active filter summary notice */
  activeFilterNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
    paddingBottom: 2,
  },
  activeFilterCount: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearFiltersText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },
  /* Card Container */
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: colors.borderLight,
    padding: 16,
    marginBottom: 14,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2.5,
  },
  cardTopContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  /* Left Column */
  avatarLeftCol: {
    alignItems: 'center',
    width: 78,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 6,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.coffeePrimary,
    backgroundColor: colors.surface,
  },
  avatarVerifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  modalidadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 3,
    maxWidth: 78,
  },
  modalidadPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.coffeePrimary,
  },
  /* Right Column */
  infoRightCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.coffeeDark,
    flexShrink: 1,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  cityText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textSecondary,
    flexShrink: 1,
  },
  specialtyText: {
    fontSize: 12.5,
    color: colors.coffeePrimary,
    fontWeight: '600',
    lineHeight: 17,
    marginBottom: 8,
  },
  topicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  topicChip: {
    backgroundColor: '#F3EAE3',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: '#E5D5C8',
  },
  topicChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.coffeeDark,
  },
  remainingTopicChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: colors.borderLight,
  },
  remainingTopicText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  /* Bottom Actions */
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  whatsappBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECDCA',
    paddingHorizontal: 10,
    paddingVertical: 7.5,
    borderRadius: 12,
    gap: 4,
  },
  emailBtnText: {
    color: '#D92D20',
    fontSize: 12,
    fontWeight: '700',
  },
  viewProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coffeePrimary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 5,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  viewProfileBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  /* Empty State */
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderStyle: 'dashed',
    marginTop: 20,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.coffeeDark,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyResetBtn: {
    marginTop: 8,
    backgroundColor: colors.coffeePrimary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyResetBtnText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
});
