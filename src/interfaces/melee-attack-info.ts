import { AttackEffect } from '@interfaces/attack-effect';

export interface MeleeAttackInfo {
  twoHands: boolean;
  speed: number;
  range?: number;
  impulse?: number;
  structureDamage?: number;
  severLimbsProbability?: number;
  effects: AttackEffect[];
  totalEffectAmount: number;
}
