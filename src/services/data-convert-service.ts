import { DeconstructRecipeInfo } from '@interfaces/deconstruct-recipe-info';
import { FabricationRecipe } from '@interfaces/fabrication-recipe';
import { FabricationRecipeInfo } from '@interfaces/fabrication-recipe-info';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import { RecipeItem } from '@interfaces/recipe-item';
import { RequiredItem } from '@interfaces/required-item';

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
    const item = itemsMap[requiredItem.identifier] || allItems.find((i) => i.tags?.includes(requiredItem.tag));
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
  if (!sourceItem.deconstructItems?.length) {
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
