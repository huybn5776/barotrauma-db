import { RelatedItem } from '@interfaces/related-item';
import { Skill } from '@interfaces/skill';
import { StatusEffect } from '@interfaces/status-effect';

export interface Holdable {
  slots: string[];
  msg?: string;
  /**
   * Should the character adjust its pose when aiming with the item.
   * Most noticeable underwater, where the character will rotate its entire body to face the direction the item is aimed at.
   */
  controlPose?: boolean;
  /**
   * Use the hand rotation instead of torso rotation for the item hold angle.
   * Enable this if you want the item just to follow with the arm when not aiming instead of forcing the arm to a hold pose.
   */
  useHandRotationForHoldAngle?: boolean;
  selectKey?: string;
  pickKey?: string;
  /**
   * How long it takes to pick up the item (in seconds).
   */
  pickingTime?: number;
  /**
   * Can the item be attached to walls.
   */
  attachable?: boolean;
  /**
   * Should the item be attached to a wall by default when it's placed in the submarine editor.
   */
  attachedByDefault?: boolean;
  /**
   * Can the item be pointed to a specific direction or do the characters always hold it in a static pose.
   * default: true
   */
  aimable?: boolean;
  /**
   * Can the item be selected by interacting with it.
   */
  canBeSelected?: boolean;
  /**
   * Can the item be picked up (or interacted with, if the pick action does something else than picking up the item).
   */
  canBePicked?: boolean;
  /**
   * Can the item be combined with other items of the same type.
   */
  canBeCombined?: boolean;
  allowSwappingWhenPicked?: boolean;
  blocksPlayers?: boolean;
  /**
   * Should the item be removed if combining it with an other item causes the condition of this item to drop to 0.
   */
  removeOnCombined?: boolean;
  /**
   * Can the "Use" action of the item be triggered by characters or just other items/StatusEffects.
   */
  characterUsable?: boolean;
  /**
   * Can the item be reattached to walls after it has been deattached (only valid if Attachable is set to true).
   * default: true
   */
  reAttachable?: boolean;
  reload?: number;
  /**
   * Can the item only be attached in limited amount? Uses permanent stat values to check for legibility.
   */
  limitedAttachable?: boolean;
  requiredSkills?: Skill[];
  requiredItems?: RelatedItem[];
  statusEffects?: StatusEffect[];
}
