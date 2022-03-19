import { ItemPrefab } from '@interfaces/Item-prefab';
import { MeleeAttackInfo } from '@interfaces/melee-attack-info';
import { RangedAttackInfo } from '@interfaces/ranged-attack-info';

export interface WeaponViewData {
  item: ItemPrefab;
  melee?: MeleeAttackInfo;
  ranged?: RangedAttackInfo;
}
