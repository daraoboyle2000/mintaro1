import Svg, { Circle, Path } from 'react-native-svg';

import { IconProps } from '../IconProps';

export function ProfileIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth="1.8" />
      <Path d="M5 19c1.3-2.7 3.8-4 7-4s5.7 1.3 7 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
