import { Stack } from 'expo-router';
import { COLORS } from '@/constants/colors';

export default function BrandsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.black },
        headerTintColor: COLORS.moltenGold,
      }}
    />
  );
}
