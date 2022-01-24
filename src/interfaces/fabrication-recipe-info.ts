import { FabricationRecipe } from '@interfaces/fabrication-recipe';
import { RecipeItem } from '@interfaces/recipe-item';

export interface FabricationRecipeInfo extends FabricationRecipe {
  displayName?: string;
  items: (RecipeItem & { condition?: string })[];
}
