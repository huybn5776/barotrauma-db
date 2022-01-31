import { DeconstructItem } from '@interfaces/deconstruct-item';
import { RecipeItem } from '@interfaces/recipe-item';

export interface DeconstructRecipeInfo {
  time: number;
  items: RecipeItem<DeconstructItem>[];
}
