import { omit } from 'ramda';

import { DeconstructItem } from '@interfaces/deconstruct-item';
import { FabricationRecipe } from '@interfaces/fabrication-recipe';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import { LocationPriceInfo } from '@interfaces/location-price-info';
import { PriceInfo } from '@interfaces/price-info';
import { RequiredItem } from '@interfaces/required-item';
import { Skill } from '@interfaces/skill';
import { deleteNilProperties, isNilOrEmpty } from '@utils/object-utils';

export function parseItemXml(documents: Document[]): ItemPrefab[] {
  return documents.flatMap((document) => {
    const itemDocuments = Array.from(document.children).flatMap((element) => {
      if (element.tagName === 'Items') {
        return Array.from(element.children);
      }
      if (element.tagName === 'Item') {
        return [element];
      }
      return [];
    });
    return Array.from(itemDocuments).map((item) => {
      const deconstruct = parseDeconstruct(getChildrenOf(item, 'Deconstruct')[0]);
      const priceElement = getChildrenOf(item, 'Price')[0];

      return deleteNilProperties({
        identifier: item.getAttribute('identifier'),
        category: item.getAttribute('category'),
        tags: item.getAttribute('tags')?.split(','),
        price: priceElement ? parsePrice(priceElement) : undefined,
        fabricationRecipes: parseRecipes(getChildrenOf(item, 'Fabricate')),
        deconstructTime: deconstruct?.time,
        deconstructItems: deconstruct?.items,
        maxStackSize: +(item.getAttribute('maxstacksize') || 1),
      }) as ItemPrefab;
    });
  });
}

export function parseTextXml(textDocuments: Document[]): Locale[] {
  return textDocuments.map((document) => {
    const infoTextsElement = getChildrenOf(document, 'infotexts')[0];
    const language = infoTextsElement.getAttribute('language');
    const name = infoTextsElement.getAttribute('translatedname');

    const searchForTag = ['entityname.', 'entitydescription.', 'displayname.'];
    const labels: Record<string, string>[] = searchForTag.map(() => ({}));
    Array.from(infoTextsElement.children).forEach((element) => {
      const matchedTagIndex = searchForTag.findIndex((tag) => element.tagName.startsWith(tag));
      if (matchedTagIndex >= 0 && element.textContent) {
        labels[matchedTagIndex][element.tagName.substring(searchForTag[matchedTagIndex].length)] = element.textContent;
      }
    });
    const [entityNames, entityDescriptions, displayNames] = labels;
    return { language, name, entityNames, entityDescriptions, displayNames } as Locale;
  });
}

export function mergeItemsName(items: ItemPrefab[], locales: Locale[], targetLocale: Locale): ItemPrefab[] {
  const preferredLocale = targetLocale.entityNames;
  const englishLocale =
    targetLocale.language === 'English'
      ? undefined
      : locales.find((locale) => locale.language === 'English')?.entityNames;
  return items.map((item) => {
    return {
      identifier: item.identifier,
      name: preferredLocale?.[item.identifier],
      englishName: englishLocale?.[item.identifier],
      ...omit(['identifier', 'name', 'englishName'], item),
    };
  });
}

function getChildrenOf(node: ParentNode, tagName: string | string[]): Element[] {
  const tagNames = Array.isArray(tagName) ? tagName : [tagName];
  return Array.from(node.children).filter((e) => tagNames.includes(e.tagName));
}

function parsePrice(priceElement: Element): PriceInfo {
  return {
    basePrice: parseNumberValue(priceElement.getAttribute('baseprice')),
    soldEverywhere: parseBooleanValue(priceElement.getAttribute('soldeverywhere')),
    canBeSpecial: parseBooleanValue(priceElement.getAttribute('canbespecial')),
    minLevelDifficulty: parseNumberValue(priceElement.getAttribute('minleveldifficulty')),
    locations: getChildrenOf(priceElement, 'Price').map(parseLocationPrice),
  } as PriceInfo;
}

function parseLocationPrice(subPriceElement: Element): LocationPriceInfo {
  return {
    locationType: subPriceElement.getAttribute('locationtype'),
    multiplier: parseNumberValue(subPriceElement.getAttribute('multiplier')),
    minAvailable: parseNumberValue(subPriceElement.getAttribute('minavailable')),
    maxAvailable: parseNumberValue(subPriceElement.getAttribute('maxavailable')),
    buyPrice: parseNumberValue(subPriceElement.getAttribute('buyprice')),
    sold: parseBooleanValue(subPriceElement.getAttribute('sold')),
  } as LocationPriceInfo;
}

function parseRecipes(recipeElements: Element[]): FabricationRecipe[] {
  return recipeElements.map((element) => {
    return deleteNilProperties({
      displayName: element.getAttribute('displayname'),
      requiredItems: parseRequiredItems(element),
      requiredTime: parseNumberValue(element.getAttribute('requiredtime')),
      requiresRecipe: parseBooleanValue(element.getAttribute('requiresrecipe')),
      outCondition: parseNumberValue(element.getAttribute('outcondition')),
      requiredSkills: parseRequiredSkills(getChildrenOf(element, 'RequiredSkill')),
      amount: parseNumberValue(element.getAttribute('amount')),
    }) as FabricationRecipe;
  });
}

function parseRequiredSkills(skillElements: Element[]): Skill[] {
  return Array.from(skillElements).map((element) => {
    return deleteNilProperties({
      identifier: element.getAttribute('identifier'),
      level: parseNumberValue(element.getAttribute('level')),
    }) as Skill;
  });
}

function parseRequiredItems(recipeElement: Element): RequiredItem[] {
  return Array.from(recipeElement.children)
    .filter((element) => ['Item', 'RequiredItem'].includes(element.tagName))
    .map((element) => {
      return deleteNilProperties({
        identifier: element.getAttribute('identifier'),
        amount: parseNumberValue(element.getAttribute('amount')),
        useCondition: parseBooleanValue(element.getAttribute('useCondition')),
        minCondition: parseNumberValue(element.getAttribute('minCondition')),
        maxCondition: parseNumberValue(element.getAttribute('maxCondition')),
      }) as RequiredItem;
    });
}

function parseDeconstruct(deconstructElement: Element | null): {
  time: number;
  items: DeconstructItem[];
} | null {
  if (!deconstructElement) {
    return null;
  }
  const time = parseNumberValue(deconstructElement.getAttribute('time')) || 0;
  const items = Array.from(getChildrenOf(deconstructElement, 'Item')).map((element) => {
    return deleteNilProperties({
      identifier: element.getAttribute('identifier'),
      minCondition: parseNumberValue(element.getAttribute('mincondition')),
      maxCondition: parseNumberValue(element.getAttribute('maxcondition')),
      outConditionMin: parseNumberValue(element.getAttribute('outconditionmin')),
      outConditionMax: parseNumberValue(element.getAttribute('outconditionmax')),
      copyCondition: parseBooleanValue(element.getAttribute('copycondition')),
      requiredDeconstructor: element.getAttribute('requireddeconstructor'),
      requiredOtherItem: element.getAttribute('requiredotheritem'),
    }) as DeconstructItem;
  });
  return { time, items };
}

function parseNumberValue(intString: string | undefined | null): number | undefined {
  if (isNilOrEmpty(intString)) {
    return undefined;
  }
  return +intString;
}

function parseBooleanValue(booleanValue: string | undefined | null): boolean | undefined {
  if (isNilOrEmpty(booleanValue)) {
    return undefined;
  }
  return booleanValue === 'true';
}
