import Svg, { Circle, Line, Rect } from 'react-native-svg';

import { IconProps } from '../IconProps';

export function BrowseIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="12" height="14" rx="2" stroke={color} strokeWidth="1.8" />
      <Line x1="6" y1="9" x2="12" y2="9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="6" y1="12" x2="11" y2="12" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Circle cx="16.8" cy="16.8" r="3.2" stroke={color} strokeWidth="1.8" />
      <Line x1="19.1" y1="19.1" x2="21" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}
