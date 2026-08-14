import { Pressable, StyleSheet } from 'react-native';
import { Menu } from 'lucide-react-native';

import { useUiStore } from '../store/uiStore';
import { useAppTheme } from '../theme/useAppTheme';

export function MenuButton() {
  const { colors } = useAppTheme();
  const openDrawer = useUiStore(state => state.openDrawer);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open menu"
      onPress={openDrawer}
      hitSlop={8}
      style={styles.button}>
      <Menu color={colors.text} size={22} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
