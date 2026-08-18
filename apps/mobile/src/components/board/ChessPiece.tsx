import { PieceSymbol, Color } from '@tempo/shared';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  size: number;
}

/**
 * Vector chess pieces (Merida-style paths). Reused from the web
 * prototype's PieceSvg so the whole product shares one piece set —
 * ported to react-native-svg since that renders identically on
 * Android/iOS/web without a rasterized sprite sheet.
 */
export function ChessPiece({ type, color, size }: ChessPieceProps) {
  const isWhite = color === 'w';
  const fill = isWhite ? '#FFFFFF' : '#1E293B';
  const stroke = isWhite ? '#334155' : '#0F172A';
  const accent = isWhite ? '#E2E8F0' : '#475569';

  switch (type) {
    case 'p':
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <Path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={fill}
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          {isWhite && (
            <Path
              d="M22.5 10c-1.65 0-3 1.35-3 3 0 .68.23 1.3.62 1.81.42-.19.89-.31 1.38-.31.49 0 .96.12 1.38.31.39-.51.62-1.13.62-1.81 0-1.65-1.35-3-3-3z"
              fill={accent}
            />
          )}
        </Svg>
      );

    case 'n':
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <Path
            d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
            fill={fill}
            stroke={stroke}
            strokeWidth={1.5}
          />
          <Path
            d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10"
            fill={fill}
            stroke={stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={15} cy={15} r={1.5} fill={isWhite ? '#0F172A' : '#F8FAFC'} />
        </Svg>
      );

    case 'b':
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <G fill={fill} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z" />
            <Path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
            <Path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" />
            <Path d="M17.5 26h10M15 30h15" strokeLinecap="butt" />
            <Path d="M22.5 15.5v5M20 18h5" stroke={stroke} strokeWidth={1.2} />
          </G>
        </Svg>
      );

    case 'r':
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <G fill={fill} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" />
            <Path d="M34 14l-3 3H14l-3-3" />
            <Path d="M31 17v12.5H14V17" />
            <Path d="M31 29.5l1.5 2.5h-20l1.5-2.5" />
            <Path d="M11 14h23" />
          </G>
        </Svg>
      );

    case 'q':
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <G fill={fill} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z" />
            <Path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11-6-15-5 15-7-11 3 12z" />
            <Path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" />
            <Path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" />
          </G>
        </Svg>
      );

    case 'k':
      return (
        <Svg width={size} height={size} viewBox="0 0 45 45">
          <G fill={fill} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M22.5 11.63V6M20 8h5" stroke={stroke} strokeWidth={1.5} />
            <Path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" />
            <Path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-1-6 2-6 2s-3-2-7-2-7 2-7 2-2-3-6-2c-3 6 6 10.5 6 10.5v7z" />
            <Path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none" />
          </G>
        </Svg>
      );

    default:
      return null;
  }
}
