import { FabricationRecipe } from '@interfaces/fabrication-recipe';
import { RecipeItem } from '@interfaces/recipe-item';
import { RequiredItem } from '@interfaces/required-item';

export interface FabricationRecipeInfo extends FabricationRecipe {
  displayName?: string;
  items: (RecipeItem<RequiredItem> & { condition?: string })[];
}
