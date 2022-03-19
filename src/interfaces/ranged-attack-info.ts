import { WeaponAmmo } from '@interfaces/weapon-ammo';

export interface RangedAttackInfo {
  twoHands: boolean;
  speed: number;
  spread?: number;
  unSkilledSpread?: number;
  recoil?: number;
  maxChargeTime?: number;
  ammoList: WeaponAmmo[];
}
