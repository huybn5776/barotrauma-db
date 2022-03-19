import { Affliction } from '@interfaces/affliction';
import { StatusEffect } from '@interfaces/status-effect';

export interface Attack {
  itemDamage?: number;
  /**
   * Applied to the target the attack hits. The direction of the impulse is from this limb towards the target (use negative values to pull the target closer).
   */
  targetImpulse?: number;
  structureDamage?: number;
  /**
   * Percentage of damage mitigation ignored when hitting armored body parts (deflecting limbs).
   */
  penetration?: number;
  /**
   * How likely the attack causes target limbs to be severed.
   */
  severLimbsProbability?: number;

  afflictions?: Affliction[];
  statusEffects?: StatusEffect[];
}
