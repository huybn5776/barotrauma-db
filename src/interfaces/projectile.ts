import { Attack } from '@interfaces/attack';
import { ParticleEmitter } from '@interfaces/particle-emitter';
import { StatusEffect } from '@interfaces/status-effect';

export interface Projectile {
  /**
   * Can the "Use" action of the item be triggered by characters or just other items/StatusEffects.
   */
  characterUsable: boolean;
  /**
   * The impulse applied to the physics body of the item when it's launched. Higher values make the projectile faster.
   * default: 10
   */
  launchImpulse?: number;
  /**
   * The random percentage modifier used to add variance to the launch impulse.
   */
  impulseSpread?: number;
  /**
   * The rotation of the item relative to the rotation of the weapon when launched (in degrees).
   */
  launchRotation?: number;

  /**
   * When set to true, the item won't fall of a target it's stuck to unless removed.
   */
  stickPermanently?: boolean;
  /**
   * Can the item stick to the character it hits.
   */
  stickToCharacters?: boolean;
  /**
   * Can the item stick to the structure it hits.
   */
  stickToStructures?: number;
  /**
   * Can the item stick to the item it hits.
   */
  stickToItems?: boolean;
  /**
   * Can the item stick even to deflective targets.
   */
  stickToDeflective?: boolean;

  /**
   * Hitscan projectiles cast a ray forwards and immediately hit whatever the ray hits.
   * It is recommended to use hitscans for very fast-moving projectiles such as bullets, because using extremely fast launch velocities may cause physics glitches.
   */
  hitscan?: boolean;
  /**
   * How many hitscans should be done when the projectile is launched.
   * Multiple hitscans can be used to simulate weapons that fire multiple projectiles at the same time
   * without having to actually use multiple projectile items, for example shotguns.
   * default: 1
   */
  hitScanCount?: number;

  /**
   * How many targets the projectile can hit before it stops.
   * default: 1
   */
  maxTargetsToHit?: number;
  /**
   * Should the item be deleted when it hits something.
   */
  removeOnHit?: boolean;
  /**
   * Random spread applied to the launch angle of the projectile (in degrees).
   */
  spread?: number;
  /**
   * Override random spread with static spread. hitscan are launched with an equal amount of angle between them. Only applies when firing multiple hitscan.
   */
  staticSpread?: boolean;

  deactivationTime?: number;
  inheritStatusEffectsFrom?: string;
  inheritRequiredSkillsFrom?: string;

  /**
   * Percentage of damage mitigation ignored when hitting armored body parts (deflecting limbs).
   */
  penetration?: number;
  /**
   * How likely the attack causes target limbs to be severed.
   */
  severLimbsProbability?: number;

  attack?: Attack;
  statusEffects?: StatusEffect[];
  particleEmitters?: ParticleEmitter[];
}
