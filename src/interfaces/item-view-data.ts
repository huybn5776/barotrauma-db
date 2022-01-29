import { LocationType } from '@enums/location-type';
import { DeconstructRecipeInfo } from '@interfaces/deconstruct-recipe-info';
import { FabricationRecipeInfo } from '@interfaces/fabrication-recipe-info';
import { ItemPrefab } from '@interfaces/Item-prefab';

export interface ItemViewData {
  item: ItemPrefab;
  fabricationRecipes: FabricationRecipeInfo[];
  deconstructRecipe: DeconstructRecipeInfo | undefined;
  soldPrices: Partial<Record<LocationType, number>> | undefined;
  hasGain?: boolean;
  hasUsage?: boolean;
}
