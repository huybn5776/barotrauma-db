import { Attack } from '@interfaces/attack';
import { ParticleEmitter } from '@interfaces/particle-emitter';
import { RelatedItem } from '@interfaces/related-item';
import { Skill } from '@interfaces/skill';
import { StatusEffect } from '@interfaces/status-effect';

export interface RangedWeapon {
  /**
   * How long the user has to wait before they can fire the weapon again (in seconds).
   * default: 1
   */
  reload?: number;
  /**
   * Random spread applied to the firing angle of the projectiles when used by a character with sufficient skills to use the weapon (in degrees).
   */
  spread?: number;
  /**
   * Random spread applied to the firing angle of the projectiles when used by a character with insufficient skills to use the weapon (in degrees).
   */
  unSkilledSpread?: number;
  /**
   * The scale of the crosshair sprite (if there is one).
   * default: 1,
   */
  crossHairScale?: number;
  /**
   * How useful the item is in combat? Used by AI to decide which item it should use as a weapon. For the sake of clarity, use a value between 0 and 100 (not enforced).
   */
  combatPriority?: number;
  /**
   * Tells the AI to hold the trigger down when it uses this weapon.
   */
  holdTrigger?: boolean;
  /**
   * The time required for a charge-type turret to charge up before able to fire.
   */
  maxChargeTime?: number;
  attack?: Attack;
  statusEffects?: StatusEffect[];
  particleEmitters?: ParticleEmitter[];
  requiredItem?: RelatedItem;
  requiredSkills?: Skill[];
}
