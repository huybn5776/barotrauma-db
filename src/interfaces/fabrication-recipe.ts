import { RequiredItem } from '@interfaces/required-item';
import { Skill } from '@interfaces/skill';

export interface FabricationRecipe {
  displayName?: string;
  requiredItems: RequiredItem[];
  requiredTime: number;
  requiresRecipe?: boolean;
  /**
   * Percentage-based from 0 to 1
   */
  outCondition?: number;
  requiredSkills?: Skill[];
  amount?: number;
}
