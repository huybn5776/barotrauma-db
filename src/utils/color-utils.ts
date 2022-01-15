/* eslint-disable no-bitwise */

export function hexToRgb(hex: string): number[] {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return [(bigint >> 16) & 0xff, (bigint >> 8) & 0xff, bigint & 0xff];
}

export function rgbToHex(color: number[]): string {
  return `#${((1 << 24) + (color[0] << 16) + (color[1] << 8) + color[2]).toString(16).slice(1)}`;
}

export function pickHex(color1: number[], color2: number[], weight: number): number[] {
  const w1 = weight;
  const w2 = 1 - w1;
  return [
    Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2),
  ];
}

export function colorScale(fromColor: string, toColor: string, weight: number): string {
  const rgbColor = pickHex(hexToRgb(fromColor), hexToRgb(toColor), weight);
  return rgbToHex(rgbColor);
}
