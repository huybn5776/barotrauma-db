export interface SpriteImage {
  texture: string;
  sourceRect?: [number, number, number, number];
  depth?: number;
  origin?: [number, number];
  sheetIndex?: [number, number];
  sheetElementSize?: [number, number];
  randomGroupId?: number;
  randomRotation?: [number, number];
  randomScale?: [number, number];
  randomOffset?: [number, number];
}
