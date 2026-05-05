import {
  Easing,
  FadeInDown,
  FadeOutDown,
  LinearTransition,
  ReduceMotion,
  withSpring,
  withTiming,
  type EntryExitAnimationFunction,
  type ReduceMotion as ReduceMotionSetting,
  type SharedValue,
} from 'react-native-reanimated';

export const motionDuration = {
  micro: 110,
  standard: 220,
  screen: 280,
} as const;

export const motionEasing = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  exit: Easing.bezier(0.4, 0, 1, 1),
} as const;

function reduceMotionSetting(enabled: boolean): ReduceMotionSetting {
  return enabled ? ReduceMotion.Always : ReduceMotion.Never;
}

export function timingConfig(duration: number, reduceMotionEnabled: boolean) {
  return {
    duration: reduceMotionEnabled ? Math.min(duration, 80) : duration,
    easing: motionEasing.standard,
    reduceMotion: reduceMotionSetting(reduceMotionEnabled),
  };
}

export function animatePress(
  value: SharedValue<number>,
  pressed: boolean,
  reduceMotionEnabled: boolean,
) {
  value.value = withTiming(
    pressed ? 1 : 0,
    timingConfig(motionDuration.micro, reduceMotionEnabled),
  );
}

export function subtleScale(pressedProgress: SharedValue<number>) {
  'worklet';
  return 1 - pressedProgress.value * 0.03;
}

export const listLayoutTransition = LinearTransition.duration(
  motionDuration.standard,
).easing(motionEasing.standard);

export function listItemEnter(reduceMotionEnabled: boolean): EntryExitAnimationFunction {
  return FadeInDown.duration(
    reduceMotionEnabled ? 110 : motionDuration.standard,
  ).easing(motionEasing.standard);
}

export function listItemExit(reduceMotionEnabled: boolean): EntryExitAnimationFunction {
  return FadeOutDown.duration(
    reduceMotionEnabled ? 90 : 180,
  ).easing(motionEasing.exit);
}

export function springPop(toValue: number, reduceMotionEnabled: boolean) {
  return withSpring(toValue, {
    damping: reduceMotionEnabled ? 40 : 16,
    stiffness: reduceMotionEnabled ? 320 : 220,
    mass: 0.7,
    reduceMotion: reduceMotionSetting(reduceMotionEnabled),
  });
}
