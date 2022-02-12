import { omit, toLower, mergeDeepRight, indexBy } from 'ramda';

import { DeconstructItem } from '@interfaces/deconstruct-item';
import { FabricationRecipe } from '@interfaces/fabrication-recipe';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import { LocationPriceInfo } from '@interfaces/location-price-info';
import { PriceInfo } from '@interfaces/price-info';
import { RequiredItem } from '@interfaces/required-item';
import { Skill } from '@interfaces/skill';
import { SpriteImage } from '@interfaces/sprite';
import { getAttrValue, getNumberArray, getBooleanValue, getNumberValue } from '@utils/element-utils';
import { deleteNilProperties } from '@utils/object-utils';

export function parseItemXml(documentFiles: { path: string; document: Document }[]): ItemPrefab[] {
  return documentFiles.flatMap(({ path, document }) => {
    const modName = path.startsWith('Mods/') ? path.split('/')[1] : undefined;
    const itemDocuments = Array.from(document.children).flatMap((element) => {
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'items') {
        return Array.from(element.children);
      }
      if (tagName === 'item') {
        return [element];
      }
      return [];
    });
    return Array.from(itemDocuments).map((item) => {
      const deconstruct = parseDeconstruct(getChildrenOf(item, 'Deconstruct')[0]);
      const priceElement = getChildrenOf(item, 'Price')[0];
      const documentDirectory = getFileDirectory(path);

      return deleteNilProperties({
        identifier: getAttrValue(item, 'identifier'),
        nameIdentifier: getAttrValue(item, 'nameIdentifier'),
        descriptionIdentifier: getAttrValue(item, 'descriptionIdentifier'),
        name: getAttrValue(item, 'name'),
        description: getAttrValue(item, 'description'),
        modName,
        category: getAttrValue(item, 'category'),
        variantOf: getAttrValue(item, 'variantOf'),
        tags: (getAttrValue(item, 'tags') || getAttrValue(item, 'Tags'))?.split(',').map((s) => s.trim()),
        price: priceElement ? parsePrice(priceElement) : undefined,
        fabricationRecipes: parseRecipes(getChildrenOf(item, 'Fabricate')),
        deconstructTime: deconstruct?.time,
        deconstructItems: deconstruct?.items,
        maxStackSize: +(getAttrValue(item, 'maxStackSize') || 1),
        sprite: parseSprite(getChildrenOf(item, 'Sprite')[0], documentDirectory),
        infectedIcon: parseSprite(getChildrenOf(item, 'InventoryIcon')[0], documentDirectory),
        containedSprites: getChildrenOf(item, 'ContainedSprite').map((element) =>
          parseSprite(element, documentDirectory),
        ),
        decorativeSprite: getChildrenOf(item, 'DecorativeSprite').map((element) =>
          parseSprite(element, documentDirectory),
        ),
        sourceXml: path,
      }) as ItemPrefab;
    });
  });
}

export function parseTextXml(textDocuments: Document[]): Locale[] {
  return textDocuments.map((document) => {
    const infoTextsElement = getChildrenOf(document, 'infoTexts')[0];
    const language = getAttrValue(infoTextsElement, 'language');
    const name = getAttrValue(infoTextsElement, 'translatedName');

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

export function mergeItemsName(items: ItemPrefab[], targetLocale: Locale, englishLocale?: Locale): ItemPrefab[] {
  const preferredEntities = targetLocale.entityNames;
  const englishEntities = englishLocale?.entityNames;
  return items.map((item) => {
    const nameIdentifier = item.nameIdentifier || item.identifier;
    const descriptionIdentifier = item.descriptionIdentifier || nameIdentifier;
    const name = preferredEntities?.[nameIdentifier] || item.name;
    let englishName = englishEntities?.[nameIdentifier] || item.name;
    if (name === englishName) {
      englishName = undefined;
    }
    return {
      identifier: item.identifier,
      name,
      englishName,
      description: targetLocale.entityDescriptions[descriptionIdentifier],
      ...omit(['identifier', 'name', 'englishName'], item),
    };
  });
}

export function mergeVariant(items: ItemPrefab[]): ItemPrefab[] {
  const itemIdMap = indexBy((item) => item.identifier, items);
  return items.map((item) => {
    const variantSource = item.variantOf && itemIdMap[item.variantOf];
    return variantSource ? (mergeDeepRight(variantSource, item) as ItemPrefab) : item;
  });
}

export function mergeLocale(locale1: Locale, locale2: Locale): Locale {
  return {
    ...locale2,
    entityNames: { ...locale1.entityNames, ...locale2.entityNames },
    entityDescriptions: { ...locale1.entityDescriptions, ...locale2.entityDescriptions },
    displayNames: { ...locale1.displayNames, ...locale2.displayNames },
  };
}

function getChildrenOf(node: ParentNode, tagName: string | string[]): Element[] {
  const tagNames = (Array.isArray(tagName) ? tagName : [tagName]).map(toLower);
  return Array.from(node.children).filter((e) => {
    const lowerTagName = e.tagName.toLowerCase();
    return tagNames.some((name) => name === lowerTagName);
  });
}

function parsePrice(priceElement: Element): PriceInfo {
  return deleteNilProperties({
    basePrice: getNumberValue(priceElement, 'basePrice'),
    soldEverywhere: getBooleanValue(priceElement, 'soldEverywhere'),
    canBeSpecial: getBooleanValue(priceElement, 'canBeSpecial'),
    minLevelDifficulty: getNumberValue(priceElement, 'minLevelDifficulty'),
    locations: getChildrenOf(priceElement, 'Price').map(parseLocationPrice),
  }) as PriceInfo;
}

function parseLocationPrice(subPriceElement: Element): LocationPriceInfo {
  return {
    locationType: getAttrValue(subPriceElement, 'locationType'),
    multiplier: getNumberValue(subPriceElement, 'multiplier'),
    minAvailable: getNumberValue(subPriceElement, 'minAvailable'),
    maxAvailable: getNumberValue(subPriceElement, 'maxAvailable'),
    sold: getBooleanValue(subPriceElement, 'sold'),
  } as LocationPriceInfo;
}

function parseRecipes(recipeElements: Element[]): FabricationRecipe[] {
  return recipeElements.map((element) => {
    return deleteNilProperties({
      displayName: getAttrValue(element, 'displayName'),
      requiredItems: parseRequiredItems(element),
      requiredTime: getNumberValue(element, 'requiredTime'),
      requiresRecipe: getBooleanValue(element, 'requiresRecipe'),
      outCondition: getNumberValue(element, 'outCondition'),
      requiredSkills: parseRequiredSkills(getChildrenOf(element, 'RequiredSkill')),
      amount: getNumberValue(element, 'amount'),
    }) as FabricationRecipe;
  });
}

function parseRequiredSkills(skillElements: Element[]): Skill[] {
  return Array.from(skillElements).map((element) => {
    return deleteNilProperties({
      identifier: getAttrValue(element, 'identifier'),
      level: getNumberValue(element, 'level'),
    }) as Skill;
  });
}

function parseRequiredItems(recipeElement: Element): RequiredItem[] {
  return Array.from(recipeElement.children)
    .filter((element) => ['Item', 'RequiredItem'].includes(element.tagName))
    .map((element) => {
      return deleteNilProperties({
        identifier: getAttrValue(element, 'identifier'),
        tag: getAttrValue(element, 'tag'),
        amount: getNumberValue(element, 'amount'),
        useCondition: getBooleanValue(element, 'useCondition'),
        minCondition: getNumberValue(element, 'minCondition'),
        maxCondition: getNumberValue(element, 'maxCondition'),
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
  const time = getNumberValue(deconstructElement, 'time') || 0;
  const items = Array.from(getChildrenOf(deconstructElement, 'Item')).map((element) => {
    return deleteNilProperties({
      identifier: getAttrValue(element, 'identifier'),
      minCondition: getNumberValue(element, 'minCondition'),
      maxCondition: getNumberValue(element, 'maxCondition'),
      outCondition: getNumberValue(element, 'outCondition'),
      outConditionMin: getNumberValue(element, 'outConditionMin'),
      outConditionMax: getNumberValue(element, 'outConditionMax'),
      copyCondition: getBooleanValue(element, 'copyCondition'),
      requiredDeconstructor: getAttrValue(element, 'requiredDeconstructor'),
      requiredOtherItem: getAttrValue(element, 'requiredOtherItem'),
      commonness: getNumberValue(element, 'commonness'),
    }) as DeconstructItem;
  });
  return { time, items };
}

function parseSprite(spriteElement: Element, documentDirectory: string): SpriteImage | undefined {
  if (!spriteElement) {
    return undefined;
  }

  let texture = getAttrValue(spriteElement, 'texture')?.replace('/JobGear/', '/Jobgear/');
  if (texture && !texture.includes('/')) {
    texture = `${documentDirectory}/${texture}`;
  }

  return deleteNilProperties({
    texture,
    sourceRect: getNumberArray(spriteElement, 'sourceRect'),
    origin: getNumberArray(spriteElement, 'origin'),
    depth: getNumberValue(spriteElement, 'depth'),
    sheetIndex: getNumberArray(spriteElement, 'sheetIndex'),
    sheetElementSize: getNumberArray(spriteElement, 'sheetElementSize'),
    randomGroupId: getNumberValue(spriteElement, 'randomGroupId'),
    randomRotation: getNumberArray(spriteElement, 'randomRotation'),
    randomScale: getNumberArray(spriteElement, 'randomScale'),
    randomOffset: getNumberArray(spriteElement, 'randomOffset'),
  }) as SpriteImage;
}
function getFileDirectory(path: string): string {
  const lastDirectory = path.lastIndexOf('/');
  return lastDirectory > -1 ? path.substring(0, lastDirectory) : '';
}
