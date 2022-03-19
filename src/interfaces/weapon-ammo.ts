import { AttackEffect } from '@interfaces/attack-effect';
import { ItemPrefab } from '@interfaces/Item-prefab';

export interface WeaponAmmo {
  item: ItemPrefab;
  effects: AttackEffect[];
  shots: number;
  structureDamage?: number;
  totalEffectAmount: number;
}
