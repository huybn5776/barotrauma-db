import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import { LocaleSelection } from '@interfaces/locale-selection';
import { mergeItemsName, mergeVariant, mergeLocale } from '@services/game-data-parser';
import { getItemsFromDb, getLocaleFromDb } from '@services/locale-data-source-service';

export async function getAllItemsAndLocale(preferredLocale: string): Promise<{ items: ItemPrefab[]; locale: Locale }> {
  const originalItems: ItemPrefab[] = await (await fetch('/data-source/items/items.json')).json();
  let englishLocale: Locale | undefined;
  if (preferredLocale !== 'english') {
    englishLocale = await getLocale('english');
  }
  const targetLocale = await getLocale(preferredLocale);

  const itemsWithLocaleItems = [...originalItems, ...(await getItemsFromDb())];
  const validItems = itemsWithLocaleItems.filter((item) => item.category !== 'Legacy');

  const itemsWithLocale = mergeItemsName(validItems, targetLocale, englishLocale);
  return { items: mergeVariant(itemsWithLocale), locale: targetLocale };
}

export async function getLocales(): Promise<LocaleSelection[]> {
  return (await fetch(`/data-source/texts/locales.json`)).json();
}

export function filterAvailableItems(items: ItemPrefab[]): ItemPrefab[] {
  const excludedNameIdentifiers = ['unidentifiedgeneticmaterial', 'geneticmaterial'];
  return items
    .filter((item) => item.fabricationRecipes?.length || item.deconstructItems?.length || item.price)
    .filter(({ nameIdentifier }) => !(nameIdentifier && excludedNameIdentifiers.includes(nameIdentifier)));
}

async function getLocale(language: string): Promise<Locale> {
  const locale = await (await fetch(`/data-source/texts/${language}.json`)).json();
  const localLocale = await getLocaleFromDb(language);
  return localLocale ? mergeLocale(locale, localLocale) : locale;
}
