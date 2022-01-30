import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import { mergeItemsName, mergeVariant } from '@services/game-data-parser';

export async function getAllItemsAndLocale(preferredLocale: string): Promise<{ items: ItemPrefab[]; locale: Locale }> {
  const originalItems: ItemPrefab[] = await (await fetch('/data-source/items/items.json')).json();
  let englishLocale: Locale | undefined;
  if (preferredLocale !== 'english') {
    englishLocale = await (await fetch(`/data-source/texts/english.json`)).json();
  }
  const targetLocale: Locale = await (await fetch(`/data-source/texts/${preferredLocale}.json`)).json();

  const validItems = originalItems.filter((item) => item.category !== 'Legacy');
  const itemsWithLocale = mergeItemsName(validItems, targetLocale, englishLocale);
  return { items: mergeVariant(itemsWithLocale), locale: targetLocale };
}

export function filterAvailableItems(items: ItemPrefab[]): ItemPrefab[] {
  const excludedNameIdentifiers = ['unidentifiedgeneticmaterial', 'geneticmaterial'];
  return items
    .filter((item) => item.fabricationRecipes?.length || item.deconstructItems?.length || item.price)
    .filter(({ nameIdentifier }) => !(nameIdentifier && excludedNameIdentifiers.includes(nameIdentifier)));
}
