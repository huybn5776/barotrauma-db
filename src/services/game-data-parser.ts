import { omit, mergeDeepRight, indexBy } from 'ramda';

import { DeconstructItem } from '@interfaces/deconstruct-item';
import { FabricationRecipe } from '@interfaces/fabrication-recipe';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import { LocationPriceInfo } from '@interfaces/location-price-info';
import { PriceInfo } from '@interfaces/price-info';
import { RequiredItem } from '@interfaces/required-item';
import { Skill } from '@interfaces/skill';
import { SpriteImage } from '@interfaces/sprite';
import {
  getAttrValue,
  getNumberValue,
  createElementValueAccessor,
  getChildrenOf,
  getMultiChildrenFor,
} from '@utils/element-utils';
import { deleteNilProperties } from '@utils/object-utils';

export function parseItemXml(documentFiles: { path: string; document: Document }[]): ItemPrefab[] {
  return documentFiles.flatMap(({ path, document }) => {
    const modName = path.startsWith('Mods/') ? path.split('/')[1] : undefined;
    const itemElements: Element[] = Array.from(document.children).flatMap((element) => {
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'items') {
        return Array.from(element.children);
      }
      if (tagName === 'item') {
        return [element];
      }
      return [];
    });
    const items: ItemPrefab[] = Array.from(itemElements).map((itemElement) => {
      const accessor = createElementValueAccessor(itemElement);
      const deconstruct = accessor.firstChildrenFor('Deconstruct', parseDeconstruct);
      const documentDirectory = getFileDirectory(path);

      return {
        identifier: accessor.string('identifier') as string,
        nameIdentifier: accessor.string('nameIdentifier'),
        descriptionIdentifier: accessor.string('descriptionIdentifier'),
        name: accessor.string('name'),
        description: accessor.string('description'),
        modName,
        category: accessor.string('category') as string,
        variantOf: accessor.string('variantOf'),
        tags: accessor.stringArray('tags'),
        price: accessor.firstChildrenFor('Price', parsePrice),
        fabricationRecipes: accessor.multiChildrenFor('Fabricate', parseRecipe),
        deconstructTime: deconstruct?.time,
        deconstructItems: deconstruct?.items,
        maxStackSize: accessor.number('maxStackSize'),
        sprite: accessor.firstChildrenFor('Sprite', (element) => parseSprite(element, documentDirectory)),
        infectedIcon: accessor.firstChildrenFor('InventoryIcon', (element) => parseSprite(element, documentDirectory)),
        containedSprites: accessor.multiChildrenFor('ContainedSprite', (element) =>
          parseSprite(element, documentDirectory),
        ),
        decorativeSprite: accessor.multiChildrenFor('DecorativeSprite', (element) =>
          parseSprite(element, documentDirectory),
        ),
        sourceXml: path,
      };
    });
    return items;
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

function parsePrice(element: Element): PriceInfo {
  const accessor = createElementValueAccessor(element);
  return deleteNilProperties({
    basePrice: accessor.number('basePrice'),
    soldEverywhere: accessor.boolean('soldEverywhere'),
    canBeSpecial: accessor.boolean('canBeSpecial'),
    minLevelDifficulty: accessor.number('minLevelDifficulty'),
    locations: accessor.multiChildrenFor('Price', parseLocationPrice),
  }) as PriceInfo;
}

function parseLocationPrice(element: Element): LocationPriceInfo {
  const accessor = createElementValueAccessor(element);
  return {
    locationType: accessor.string('locationType'),
    multiplier: accessor.number('multiplier'),
    minAvailable: accessor.number('minAvailable'),
    maxAvailable: accessor.number('maxAvailable'),
    sold: accessor.boolean('sold'),
  } as LocationPriceInfo;
}

function parseRecipe(element: Element): FabricationRecipe {
  const accessor = createElementValueAccessor(element);
  return {
    displayName: accessor.string('displayName'),
    requiredItems: parseRequiredItems(element),
    requiredTime: accessor.number('requiredTime') as number,
    requiresRecipe: accessor.boolean('requiresRecipe'),
    outCondition: accessor.number('outCondition'),
    requiredSkills: accessor.multiChildrenFor('RequiredSkill', parseRequiredSkill),
    amount: accessor.number('amount'),
  };
}

function parseRequiredSkill(element: Element): Skill {
  return { identifier: getAttrValue(element, 'identifier'), level: getNumberValue(element, 'level') } as Skill;
}

function parseRequiredItems(recipeElement: Element): RequiredItem[] {
  return Array.from(recipeElement.children)
    .filter((element) => ['Item', 'RequiredItem'].includes(element.tagName))
    .map((element) => {
      const accessor = createElementValueAccessor(element);
      return {
        identifier: accessor.string('identifier'),
        tag: accessor.string('tag'),
        amount: accessor.number('amount'),
        useCondition: accessor.boolean('useCondition'),
        minCondition: accessor.number('minCondition'),
        maxCondition: accessor.number('maxCondition'),
      };
    });
}

function parseDeconstruct(deconstructElement: Element): {
  time: number | undefined;
  items: DeconstructItem[] | undefined;
} | null {
  return {
    time: getNumberValue(deconstructElement, 'time'),
    items: getMultiChildrenFor(deconstructElement, 'Item', (element) => {
      const accessor = createElementValueAccessor(element);
      return {
        identifier: accessor.string('identifier') as string,
        minCondition: accessor.number('minCondition'),
        maxCondition: accessor.number('maxCondition'),
        outCondition: accessor.number('outCondition'),
        outConditionMin: accessor.number('outConditionMin'),
        outConditionMax: accessor.number('outConditionMax'),
        copyCondition: accessor.boolean('copyCondition'),
        requiredDeconstructor: accessor.string('requiredDeconstructor'),
        requiredOtherItem: accessor.string('requiredOtherItem'),
        commonness: accessor.number('commonness'),
      };
    }),
  };
}

function parseSprite(element: Element, documentDirectory: string): SpriteImage {
  const accessor = createElementValueAccessor(element);
  let texture = accessor.string('texture')?.replace('/JobGear/', '/Jobgear/');
  if (texture && !texture.includes('/')) {
    texture = `${documentDirectory}/${texture}`;
  }

  return {
    texture,
    sourceRect: accessor.numberArray('sourceRect'),
    origin: accessor.numberArray('origin'),
    depth: accessor.number('depth'),
    sheetIndex: accessor.numberArray('sheetIndex'),
    sheetElementSize: accessor.numberArray('sheetElementSize'),
    randomGroupId: accessor.number('randomGroupId'),
    randomRotation: accessor.numberArray('randomRotation'),
    randomScale: accessor.numberArray('randomScale'),
    randomOffset: accessor.numberArray('randomOffset'),
  } as SpriteImage;
}

function getFileDirectory(path: string): string {
  const lastDirectory = path.lastIndexOf('/');
  return lastDirectory > -1 ? path.substring(0, lastDirectory) : '';
}
