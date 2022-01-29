import { LocationType } from '@enums/location-type';
import { DeconstructRecipeInfo } from '@interfaces/deconstruct-recipe-info';
import { FabricationRecipe } from '@interfaces/fabrication-recipe';
import { FabricationRecipeInfo } from '@interfaces/fabrication-recipe-info';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { ItemViewData } from '@interfaces/item-view-data';
import { Locale } from '@interfaces/locale';
import { RecipeItem } from '@interfaces/recipe-item';
import { RequiredItem } from '@interfaces/required-item';
import { isNotNilOrEmpty } from '@utils/object-utils';

export interface DataConvertContext {
  itemsMap: Record<string, ItemPrefab>;
  allItems: ItemPrefab[];
  locale: Locale;
}

export function convertFabricationRecipe(
  sourceItem: ItemPrefab,
  fabricationRecipe: FabricationRecipe,
  context: DataConvertContext,
): FabricationRecipeInfo {
  const { itemsMap, allItems } = context;

  const itemsCountMap: Record<string, { count: number; item: ItemPrefab; requiredItem: RequiredItem }> = {};
  fabricationRecipe.requiredItems.forEach((requiredItem) => {
    const item = findRecipeItemByIdentifier(requiredItem, itemsMap) || findRecipeItemByTag(requiredItem, allItems);
    if (!item) {
      return;
    }
    const itemCount =
      itemsCountMap[item.identifier] ?? (itemsCountMap[item.identifier] = { count: 0, item, requiredItem });
    itemCount.count += 1;
  });
  const countedItems = Object.values(itemsCountMap).map(({ count, item, requiredItem }) => ({
    count,
    item,
    condition: getRequiredItemCondition(requiredItem),
  }));

  return {
    ...fabricationRecipe,
    displayName: getDisplayName(sourceItem, fabricationRecipe, context),
    items: countedItems,
  };
}

function findRecipeItemByIdentifier(
  requiredItem: RequiredItem,
  itemsMap: Record<string, ItemPrefab>,
): ItemPrefab | undefined {
  return (requiredItem.identifier && itemsMap[requiredItem.identifier]) || undefined;
}

function findRecipeItemByTag(requiredItem: RequiredItem, allItems: ItemPrefab[]): ItemPrefab | undefined {
  const { tag } = requiredItem;
  return (tag && allItems.find((item) => item.tags?.includes(tag))) || undefined;
}

function getRequiredItemCondition(item: RequiredItem): string | undefined {
  const min = item.minCondition === undefined ? undefined : item.minCondition * 100;
  const max = item.maxCondition === undefined ? undefined : item.maxCondition * 100;
  if (min !== undefined && max !== undefined && min === max) {
    return `${min}%`;
  }
  if (min && max === undefined) {
    return `>=${min}%`;
  }
  if (!min && max !== undefined) {
    return `<=${max}%`;
  }
  if (min && max !== undefined) {
    return `${min}~${max}%`;
  }
  return undefined;
}

function getDisplayName(
  sourceItem: ItemPrefab,
  fabricationRecipe: FabricationRecipe,
  context: DataConvertContext,
): string | undefined {
  const name = fabricationRecipe.displayName;
  if (name) {
    return context.locale.displayNames[name]?.replace('[itemname]', sourceItem.name || '');
  }
  return undefined;
}

export function convertDeconstructRecipe(
  sourceItem: ItemPrefab,
  context: DataConvertContext,
): DeconstructRecipeInfo | undefined {
  if (!sourceItem.deconstructItems?.length || !sourceItem.deconstructTime) {
    return undefined;
  }
  const itemsCountMap: Record<string, number> = {};
  sourceItem.deconstructItems.forEach((item) => {
    itemsCountMap[item.identifier] = (itemsCountMap[item.identifier] || 0) + (item.outCondition || 1);
  });
  let deconstructItems: RecipeItem[] = Object.entries(itemsCountMap).map(([identifier, count]) => ({
    count,
    item: context.itemsMap[identifier],
  }));
  deconstructItems = orderItemInFabricationRecipe(sourceItem, deconstructItems);
  return { time: sourceItem.deconstructTime, items: deconstructItems };
}

function orderItemInFabricationRecipe(sourceItem: ItemPrefab, deconstructItems: RecipeItem[]): RecipeItem[] {
  const recipeItems = sourceItem.fabricationRecipes?.[0]?.requiredItems;
  if (!recipeItems) {
    return deconstructItems;
  }
  let pickingItems = [...deconstructItems];
  const sortingItems: RecipeItem[] = [];
  recipeItems.forEach((recipeItem) => {
    const sameItem = pickingItems.find((pickingItem) => pickingItem.item.identifier === recipeItem.identifier);
    if (sameItem) {
      sortingItems.push(sameItem);
      pickingItems = pickingItems.filter((pickingItem) => pickingItem !== sameItem);
    }
  });
  return [...sortingItems, ...pickingItems];
}

export function convertSoldIn(sourceItem: ItemPrefab): Partial<Record<LocationType, number>> | undefined {
  const { price } = sourceItem;
  if (!price || !price.locations) {
    return undefined;
  }
  const soldPrices: Partial<Record<LocationType, number>> = {};
  price.locations.forEach((location) => {
    if (location.sold !== false) {
      soldPrices[location.locationType] = price.basePrice * (location.multiplier || 1);
    }
  });
  return soldPrices;
}

export function checkGainAndUsage(
  itemViewData: ItemViewData,
  context: DataConvertContext,
): { hasGain: boolean; hasUsage: boolean } {
  const hasGain =
    isNotNilOrEmpty(itemViewData.soldPrices) ||
    itemViewData.fabricationRecipes.length > 0 ||
    checkItemHasDeconstructRecipeForIt(itemViewData.item.identifier, context.allItems);
  const hasUsage = checkItemHasUsage(itemViewData.item.identifier, context.allItems);
  return { hasGain, hasUsage };
}

function checkItemHasDeconstructRecipeForIt(itemId: string, allItems: ItemPrefab[]): boolean {
  return allItems.some((item) =>
    item.deconstructItems?.some((deconstructItem) => deconstructItem.identifier === itemId),
  );
}

function checkItemHasUsage(itemId: string, allItems: ItemPrefab[]): boolean {
  return allItems.some((item) =>
    item.fabricationRecipes?.some((fabricationRecipe) =>
      fabricationRecipe.requiredItems.some((requiredItem) => requiredItem.identifier === itemId),
    ),
  );
}
