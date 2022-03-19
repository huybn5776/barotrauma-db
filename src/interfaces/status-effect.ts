import { ActionType } from '@enums/action-type';
import { TargetType } from '@enums/target-type';
import { Affliction } from '@interfaces/affliction';
import { Conditional } from '@interfaces/conditional';
import { Explosion } from '@interfaces/explosion';
import { GiveExperience } from '@interfaces/give-experience';
import { GiveSkill } from '@interfaces/give-skill';
import { ParticleEmitter } from '@interfaces/particle-emitter';
import { RelatedItem } from '@interfaces/related-item';

export interface StatusEffect {
  type: ActionType;
  targets: TargetType[];
  condition?: number;
  disableDeltaTime?: boolean;
  duration?: number;
  tags?: string[];
  targetItemComponent?: string;
  setValue?: boolean;
  comparison?: string;
  delay?: number;

  use?: boolean;
  remove?: boolean;
  fireSize?: number;
  conditional?: Conditional;
  requiredItem?: RelatedItem;
  explosion?: Explosion;
  afflictions?: Affliction[];
  reduceAfflictions?: Affliction[];
  particleEmitters?: ParticleEmitter[];
  giveSkills?: GiveSkill[];
  giveExperiences?: GiveExperience[];
}
