import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';

export const EmptyFeed: React.FC = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Clean, completely empty feed area */}
      <View style={styles.emptyCanvas} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyCanvas: {
    flex: 1,
  },
});
