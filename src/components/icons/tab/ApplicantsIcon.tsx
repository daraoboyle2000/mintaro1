import Svg, { Circle, Path } from 'react-native-svg';

import { IconProps } from '../IconProps';

export function ApplicantsIcon({ size = 24, color = 'currentColor' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="3.2" stroke={color} strokeWidth="1.8" />
      <Path
        d="M3.8 19.2c.7-3.2 2.6-5 5.2-5s4.5 1.8 5.2 5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Circle cx="16.5" cy="9" r="2.5" stroke={color} strokeWidth="1.8" />
      <Path
        d="M14.7 14.2c2.8.2 4.6 1.9 5.3 5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}
