import Svg, { Line, Path, Rect } from 'react-native-svg';

import { IconProps } from '../IconProps';

export function MyStudiesIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="3.5" width="14" height="17" rx="2" stroke={color} strokeWidth="1.8" />
      <Line x1="8" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M8.5 12.5l2.2 2.2 4.8-4.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
