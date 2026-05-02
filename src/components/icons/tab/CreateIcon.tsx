import Svg, { Circle, Line } from 'react-native-svg';

import { IconProps } from '../IconProps';

export function CreateIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.8" />
      <Line x1="12" y1="8.5" x2="12" y2="15.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="8.5" y1="12" x2="15.5" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
