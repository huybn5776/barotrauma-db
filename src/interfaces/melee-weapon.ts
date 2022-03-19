import { Attack } from '@interfaces/attack';
import { RelatedItem } from '@interfaces/related-item';
import { Skill } from '@interfaces/skill';
import { StatusEffect } from '@interfaces/status-effect';

export interface MeleeWeapon {
  /**
   * How long the user has to wait before they can hit with the weapon again (in seconds).
   * default: 0.5
   */
  reload?: number;

  /**
   * Divisor when item is variant from something.
   */
  reloadDivisor?: number;
  /**
   * An estimation of how close the item has to be to the target for it to hit.
   * Used by AI characters to determine when they're close enough to hit a target.
   */
  range?: number;
  slots: string[];
  /**
   * Can the item be combined with other items of the same type.
   */
  canBeCombined?: boolean;
  /**
   * How useful the item is in combat? Used by AI to decide which item it should use as a weapon. For the sake of clarity, use a value between 0 and 100 (not enforced).
   */
  combatPriority?: number;
  /**
   * A text displayed next to the item when it's highlighted (generally instructs how to interact with the item, e.g. "[Mouse1] Pick up").
   */
  msg?: string;
  /**
   * Should the item be removed if combining it with an other item causes the condition of this item to drop to 0.
   */
  removeOnCombined?: boolean;
  /**
   * Defines items that boost the weapon functionality, like battery cell for stun batons.
   */
  preferredContainedItems?: string[];
  /**
   * Can the item be pointed to a specific direction or do the characters always hold it in a static pose.
   * default: true
   */
  aimable?: boolean;
  attack?: Attack;
  statusEffects?: StatusEffect[];
  requiredItem?: RelatedItem;
  requiredSkills?: Skill[];
}
