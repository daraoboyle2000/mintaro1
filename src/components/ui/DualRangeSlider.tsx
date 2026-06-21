import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { theme } from '@/theme';

type RangeValue = { min: number; max: number };

type ActiveThumb = 'min' | 'max';

const DEFAULT_MIN = 18;
const DEFAULT_MAX = 100;
const TOUCH_TARGET = 56;
const THUMB_SIZE = 32;

function clamp(value: number, lower: number, upper: number) {
  'worklet';
  return Math.min(upper, Math.max(lower, value));
}

export function DualRangeSlider({
  min,
  max,
  minimum = DEFAULT_MIN,
  maximum = DEFAULT_MAX,
  onChange,
  onDragActiveChange
}: {
  min: number;
  max: number;
  minimum?: number;
  maximum?: number;
  onChange: (next: RangeValue) => void;
  onDragActiveChange?: (active: boolean) => void;
}) {
  const trackWidth = useSharedValue(1);
  const minAge = useSharedValue(min);
  const maxAge = useSharedValue(max);
  const activeThumb = useSharedValue<ActiveThumb>('min');
  const span = maximum - minimum;

  const syncToReact = (nextMin: number, nextMax: number) => {
    onChange({ min: nextMin, max: nextMax });
  };

  const setDragActive = (active: boolean) => {
    onDragActiveChange?.(active);
  };

  useEffect(() => {
    minAge.value = clamp(Math.round(min), minimum, maxAge.value);
  }, [min, minAge, minimum, maxAge]);

  useEffect(() => {
    maxAge.value = clamp(Math.round(max), minAge.value, maximum);
  }, [max, maxAge, maximum, minAge]);

  const updateNearestThumb = (x: number) => {
    'worklet';
    const width = Math.max(trackWidth.value, 1);
    const safeX = clamp(x, 0, width);
    const age = Math.round(minimum + (safeX / width) * span);
    const minX = ((minAge.value - minimum) / span) * width;
    const maxX = ((maxAge.value - minimum) / span) * width;

    if (Math.abs(safeX - minX) <= Math.abs(safeX - maxX)) {
      activeThumb.value = 'min';
      minAge.value = clamp(age, minimum, maxAge.value);
    } else {
      activeThumb.value = 'max';
      maxAge.value = clamp(age, minAge.value, maximum);
    }

    runOnJS(syncToReact)(minAge.value, maxAge.value);
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-10, 10])
    .onBegin((event) => {
      updateNearestThumb(event.x);
    })
    .onStart(() => {
      runOnJS(setDragActive)(true);
    })
    .onUpdate((event) => {
      const width = Math.max(trackWidth.value, 1);
      const age = Math.round(minimum + (clamp(event.x, 0, width) / width) * span);
      if (activeThumb.value === 'min') {
        minAge.value = clamp(age, minimum, maxAge.value);
      } else {
        maxAge.value = clamp(age, minAge.value, maximum);
      }
      runOnJS(syncToReact)(minAge.value, maxAge.value);
    })
    .onFinalize(() => {
      runOnJS(syncToReact)(minAge.value, maxAge.value);
      runOnJS(setDragActive)(false);
    });

  const tap = Gesture.Tap()
    .maxDuration(250)
    .onEnd((event) => {
      updateNearestThumb(event.x);
    });

  const gesture = Gesture.Exclusive(pan, tap);

  const fillStyle = useAnimatedStyle(() => {
    const width = Math.max(trackWidth.value, 1);
    const left = ((minAge.value - minimum) / span) * width;
    const right = width - ((maxAge.value - minimum) / span) * width;
    return { left, right };
  });

  const minThumbStyle = useAnimatedStyle(() => {
    const width = Math.max(trackWidth.value, 1);
    return { transform: [{ translateX: ((minAge.value - minimum) / span) * width - TOUCH_TARGET / 2 }] };
  });

  const maxThumbStyle = useAnimatedStyle(() => {
    const width = Math.max(trackWidth.value, 1);
    return { transform: [{ translateX: ((maxAge.value - minimum) / span) * width - TOUCH_TARGET / 2 }] };
  });

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={styles.dualSlider}
        onLayout={(event) => {
          trackWidth.value = Math.max(event.nativeEvent.layout.width, 1);
        }}
      >
        <View style={styles.sliderTrack}><Animated.View style={[styles.sliderFill, fillStyle]} /></View>
        <Animated.View pointerEvents="none" style={[styles.sliderTouchTarget, minThumbStyle]}><View style={styles.sliderThumb}><Text style={styles.thumbLabel}>{min}</Text></View></Animated.View>
        <Animated.View pointerEvents="none" style={[styles.sliderTouchTarget, maxThumbStyle]}><View style={styles.sliderThumb}><Text style={styles.thumbLabel}>{max}</Text></View></Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  dualSlider: { height: 60, justifyContent: 'center', marginHorizontal: theme.spacing.sm },
  sliderTrack: { height: 8, borderRadius: 999, backgroundColor: theme.colors.border, overflow: 'hidden' },
  sliderFill: { position: 'absolute', top: 0, bottom: 0, backgroundColor: theme.colors.primary, borderRadius: 999 },
  sliderTouchTarget: { position: 'absolute', width: TOUCH_TARGET, height: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
  sliderThumb: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: THUMB_SIZE / 2, backgroundColor: theme.colors.primaryDark, alignItems: 'center', justifyContent: 'center' },
  thumbLabel: { color: '#fff', fontSize: 11, fontWeight: '900' }
});
