import Svg, { Rect } from 'react-native-svg';

import { IconProps } from '../IconProps';

export function DashboardIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
      <Rect x="13" y="4" width="7" height="11" rx="1.5" stroke={color} strokeWidth="1.8" />
      <Rect x="4" y="13" width="7" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
      <Rect x="13" y="17" width="7" height="3" rx="1.2" stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}
