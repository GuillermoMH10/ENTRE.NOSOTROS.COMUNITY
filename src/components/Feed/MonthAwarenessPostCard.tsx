import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MONTHS_DATA, MonthTheme } from '../../data/monthsData';
import { colors } from '../../theme/colors';

interface MonthAwarenessPostCardProps {
  onOpenMonthDetail?: (monthIndex: number) => void;
}

export const MonthAwarenessPostCard: React.FC<MonthAwarenessPostCardProps> = ({
  onOpenMonthDetail,
}) => {
  const currentMonthIndex = new Date().getMonth();
  const currentMonth: MonthTheme = MONTHS_DATA[currentMonthIndex] || MONTHS_DATA[0];
  const [imageAspectRatio, setImageAspectRatio] = useState<number>(1.5);
  const [containerWidth, setContainerWidth] = useState<number>(560);

  useEffect(() => {
    if (currentMonth.imageUrl) {
      Image.getSize(
        currentMonth.imageUrl,
        (width, height) => {
          if (width > 0 && height > 0) {
            setImageAspectRatio(width / height);
          }
        },
        () => {}
      );
    }
  }, [currentMonth.imageUrl]);

  const handlePress = () => {
    if (onOpenMonthDetail) {
      onOpenMonthDetail(currentMonthIndex);
    }
  };

  const isVertical = imageAspectRatio < 0.98;
  let verticalBoxStyle: { width: number; height: number } | null = null;
  if (isVertical && containerWidth > 0) {
    const maxGridColWidth = Math.min(containerWidth * 0.49, 275);
    const maxGridColHeight = 340;
    let w = maxGridColWidth;
    let h = w / imageAspectRatio;
    if (h > maxGridColHeight) {
      h = maxGridColHeight;
      w = h * imageAspectRatio;
    }
    verticalBoxStyle = {
      width: Math.round(w),
      height: Math.round(h),
    };
  }

  return (
    <View style={styles.outerContainer}>
      <View
        style={[
          styles.cardContainer,
          {
            borderColor: currentMonth.primaryColor + '50',
            shadowColor: currentMonth.primaryColor,
          },
        ]}
      >
        {/* Header: Author Avatar, Username, Verified Badge & Month Tagline */}
        <View style={styles.headerRow}>
          <Image
            source={require('../../../assets/perfilANIMA.png')}
            style={[
              styles.authorAvatar,
              { borderColor: currentMonth.primaryColor },
            ]}
            resizeMode="cover"
          />
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.authorUsername}>ANIMA</Text>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={currentMonth.primaryColor}
                style={styles.verifiedBadge}
              />
            </View>
            <Text
              style={[
                styles.monthSubtitle,
                { color: currentMonth.primaryColor },
              ]}
            >
              Conoce sobre el mes de {currentMonth.name.toLowerCase()}
            </Text>
          </View>
        </View>

        {/* Commemoration Title in Bold */}
        <Text style={styles.commemorationTitle}>
          {currentMonth.themeTitle}
        </Text>

        {/* Normal Descriptive Text */}
        <Text style={styles.descriptiveText} numberOfLines={4}>
          {currentMonth.speech}
        </Text>

        {/* Commemoration Image */}
        {currentMonth.imageUrl ? (
          <View
            style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-start' }}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              if (w > 0 && Math.abs(w - containerWidth) > 2) {
                setContainerWidth(w);
              }
            }}
          >
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={handlePress}
              style={[
                styles.imageWrapper,
                isVertical && verticalBoxStyle
                  ? { width: verticalBoxStyle.width, height: verticalBoxStyle.height }
                  : { width: '100%', aspectRatio: imageAspectRatio },
              ]}
            >
              <Image
                source={{ uri: currentMonth.imageUrl }}
                style={styles.postImage}
                resizeMode="cover"
                onLoad={(e) => {
                  const src = e?.nativeEvent?.source;
                  const target = (e?.nativeEvent as any)?.target;
                  const w = src?.width || target?.naturalWidth;
                  const h = src?.height || target?.naturalHeight;
                  if (w && h && w > 0 && h > 0) {
                    setImageAspectRatio(w / h);
                  }
                }}
              />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Discreet Small Link: Conoce más sobre los meses */}
        <TouchableOpacity
          style={styles.discreetFooterAction}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.discreetLeftCol}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={currentMonth.primaryColor}
            />
            <Text style={styles.discreetActionText}>
              Conoce más sobre los meses y sus causas
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={currentMonth.primaryColor}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1.4,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorUsername: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.coffeeDeep,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  monthSubtitle: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 1,
    letterSpacing: 0.1,
  },
  commemorationTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.coffeeDark,
    lineHeight: 20,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  descriptiveText: {
    fontSize: 13.5,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 10,
    letterSpacing: 0.1,
  },
  imageWrapper: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  discreetFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  discreetLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discreetActionText: {
    fontSize: 11.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
