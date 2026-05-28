import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const { width, height } = Dimensions.get('window');

export const MeshBackground = ({ children }: { children: React.ReactNode }) => {
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withRepeat(
      withTiming(1, { duration: 10000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const blob1Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(anim.value, [0, 1], [-20, 40]) },
      { translateY: interpolate(anim.value, [0, 1], [-30, 50]) },
      { scale: interpolate(anim.value, [0, 1], [1, 1.2]) },
    ],
  }));

  const blob2Style = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(anim.value, [0, 1], [40, -30]) },
      { translateY: interpolate(anim.value, [0, 1], [50, -20]) },
      { scale: interpolate(anim.value, [0, 1], [1.1, 0.9]) },
    ],
  }));

  return (
    <View className="flex-1 bg-white">
      {/* Base Gradient */}
      <LinearGradient
        colors={['#FDFCFB', '#E5E5BE']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Organic Blobs */}
      <Animated.View
        style={[
          blob1Style,
          {
            position: 'absolute',
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: width * 0.4,
            backgroundColor: '#FFD700',
            opacity: 0.1,
            top: -width * 0.2,
            left: -width * 0.1,
          },
        ]}
      />

      <Animated.View
        style={[
          blob2Style,
          {
            position: 'absolute',
            width: width * 0.6,
            height: width * 0.6,
            borderRadius: width * 0.3,
            backgroundColor: '#FF416C',
            opacity: 0.08,
            bottom: height * 0.1,
            right: -width * 0.1,
          },
        ]}
      />

      {children}
    </View>
  );
};
