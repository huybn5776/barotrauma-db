import { AfflictionType } from '@enums/affliction-type';

export interface Affliction {
  identifier: AfflictionType;
  strength: number;
  probability?: number;
}
