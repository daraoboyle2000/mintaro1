declare module 'react-native-gesture-handler' {
  import type { ComponentType, ReactNode } from 'react';
  import type { ViewStyle } from 'react-native';

  type GestureEvent = { x: number; translationX: number; translationY: number };
  type GestureBuilder = {
    activeOffsetX(value: [number, number]): GestureBuilder;
    failOffsetY(value: [number, number]): GestureBuilder;
    maxDuration(value: number): GestureBuilder;
    onBegin(callback: (event: GestureEvent) => void): GestureBuilder;
    onStart(callback: (event: GestureEvent) => void): GestureBuilder;
    onUpdate(callback: (event: GestureEvent) => void): GestureBuilder;
    onEnd(callback: (event: GestureEvent) => void): GestureBuilder;
    onFinalize(callback: (event: GestureEvent) => void): GestureBuilder;
  };

  export const Gesture: {
    Pan(): GestureBuilder;
    Tap(): GestureBuilder;
    Exclusive(...gestures: GestureBuilder[]): GestureBuilder;
  };
  export const GestureDetector: ComponentType<{ gesture: GestureBuilder; children: ReactNode }>;
  export const GestureHandlerRootView: ComponentType<{ style?: ViewStyle; children: ReactNode }>;
}

declare module 'react-native-reanimated' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';

  export type SharedValue<T> = { value: T };
  export function runOnJS<T extends (...args: never[]) => unknown>(fn: T): T;
  export function useAnimatedStyle<T extends object>(updater: () => T): T;
  export function useSharedValue<T>(initial: T): SharedValue<T>;
  const Animated: { View: ComponentType<ViewProps & { style?: unknown }> };
  export default Animated;
}
