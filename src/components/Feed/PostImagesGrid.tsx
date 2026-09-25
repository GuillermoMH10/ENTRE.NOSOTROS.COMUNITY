import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';

interface PostImagesGridProps {
  images: string[];
  onImagePress: (index: number) => void;
}

export const PostImagesGrid: React.FC<PostImagesGridProps> = ({
  images,
  onImagePress,
}) => {
  if (!images || images.length === 0) return null;

  const count = images.length;

  if (count === 1) {
    return (
      <TouchableOpacity
        style={styles.singleImageContainer}
        activeOpacity={0.9}
        onPress={() => onImagePress(0)}
      >
        <Image source={{ uri: images[0] }} style={styles.singleImage} resizeMode="cover" />
      </TouchableOpacity>
    );
  }

  if (count === 2) {
    return (
      <View style={styles.twoImagesContainer}>
        <TouchableOpacity
          style={styles.halfImageWrapper}
          activeOpacity={0.9}
          onPress={() => onImagePress(0)}
        >
          <Image source={{ uri: images[0] }} style={styles.imageFill} resizeMode="cover" />
        </TouchableOpacity>
        <View style={styles.imageGap} />
        <TouchableOpacity
          style={styles.halfImageWrapper}
          activeOpacity={0.9}
          onPress={() => onImagePress(1)}
        >
          <Image source={{ uri: images[1] }} style={styles.imageFill} resizeMode="cover" />
        </TouchableOpacity>
      </View>
    );
  }

  // 3 images grid
  return (
    <View style={styles.threeImagesContainer}>
      <TouchableOpacity
        style={styles.threeLeftCol}
        activeOpacity={0.9}
        onPress={() => onImagePress(0)}
      >
        <Image source={{ uri: images[0] }} style={styles.imageFill} resizeMode="cover" />
      </TouchableOpacity>
      <View style={styles.imageGap} />
      <View style={styles.threeRightCol}>
        <TouchableOpacity
          style={styles.halfImageVerticalWrapper}
          activeOpacity={0.9}
          onPress={() => onImagePress(1)}
        >
          <Image source={{ uri: images[1] }} style={styles.imageFill} resizeMode="cover" />
        </TouchableOpacity>
        <View style={styles.imageGapVertical} />
        <TouchableOpacity
          style={styles.halfImageVerticalWrapper}
          activeOpacity={0.9}
          onPress={() => onImagePress(2)}
        >
          <Image source={{ uri: images[2] }} style={styles.imageFill} resizeMode="cover" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  singleImageContainer: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginTop: 8,
    marginBottom: 4,
  },
  singleImage: {
    width: '100%',
    height: '100%',
  },
  twoImagesContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  halfImageWrapper: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.surface,
  },
  threeImagesContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 4,
  },
  threeLeftCol: {
    flex: 1.2,
    height: '100%',
    backgroundColor: colors.surface,
  },
  threeRightCol: {
    flex: 1,
    height: '100%',
  },
  halfImageVerticalWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.surface,
  },
  imageFill: {
    width: '100%',
    height: '100%',
  },
  imageGap: {
    width: 4,
  },
  imageGapVertical: {
    height: 4,
  },
});
