import { AfflictionType } from '@enums/affliction-type';

export interface AttackEffect {
  type: AfflictionType;
  amount: number;
  range?: number;
  probability?: number;
}
