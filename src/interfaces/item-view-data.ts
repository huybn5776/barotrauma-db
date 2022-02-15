import { DeconstructRecipeInfo } from '@interfaces/deconstruct-recipe-info';
import { FabricationRecipeInfo } from '@interfaces/fabrication-recipe-info';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { LocationPriceViewData } from '@interfaces/location-price-view-data';
import { SpriteImage } from '@interfaces/sprite';

export interface ItemViewData {
  item: ItemPrefab;
  fabricationRecipes: FabricationRecipeInfo[];
  deconstructRecipe: DeconstructRecipeInfo | undefined;
  soldPrices: LocationPriceViewData[];
  collectibleItemImages: SpriteImage[];
  hasGain?: boolean;
  hasUsage?: boolean;
  isTemporaryRow?: boolean;
}
