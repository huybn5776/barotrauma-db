import { DeconstructItem } from '@interfaces/deconstruct-item';
import { FabricationRecipe } from '@interfaces/fabrication-recipe';
import { PriceInfo } from '@interfaces/price-info';

export interface ItemPrefab {
  identifier: string;
  name?: string;
  englishName?: string;
  category: string;
  tags: string[];
  price: PriceInfo;
  fabricationRecipes: FabricationRecipe[];
  deconstructTime: number;
  deconstructItems: DeconstructItem[];
  maxStackSize: number;
}
