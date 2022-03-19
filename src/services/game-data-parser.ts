import { omit, mergeDeepRight, indexBy } from 'ramda';

import { ActionType } from '@enums/action-type';
import { AfflictionType } from '@enums/affliction-type';
import { ConditionOperator } from '@enums/condition-operator';
import { RelationType } from '@enums/relation-type';
import { TargetType } from '@enums/target-type';
import { Affliction } from '@interfaces/affliction';
import { Attack } from '@interfaces/attack';
import { Conditional } from '@interfaces/conditional';
import { DeconstructItem } from '@interfaces/deconstruct-item';
import { Explosion } from '@interfaces/explosion';
import { FabricationRecipe } from '@interfaces/fabrication-recipe';
import { GiveExperience } from '@interfaces/give-experience';
import { GiveSkill } from '@interfaces/give-skill';
import { Holdable } from '@interfaces/holdable';
import { ItemComponent } from '@interfaces/item-component';
import { ItemContainer } from '@interfaces/item-container';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import { LocationPriceInfo } from '@interfaces/location-price-info';
import { MeleeWeapon } from '@interfaces/melee-weapon';
import { ParticleEmitter } from '@interfaces/particle-emitter';
import { PriceInfo } from '@interfaces/price-info';
import { Projectile } from '@interfaces/projectile';
import { RangedWeapon } from '@interfaces/ranged-weapon';
import { RelatedItem } from '@interfaces/related-item';
import { RequiredItem } from '@interfaces/required-item';
import { Skill } from '@interfaces/skill';
import { SpriteImage } from '@interfaces/sprite';
import { StatusEffect } from '@interfaces/status-effect';
import { Throwable } from '@interfaces/throwable';
import {
  getAttrValue,
  getNumberValue,
  createElementValueAccessor,
  getChildrenOf,
  getMultiChildrenFor,
} from '@utils/element-utils';
import { deleteNilProperties } from '@utils/object-utils';

export function parseItemXml(documentFiles: { path: string; document: Document }[]): ItemPrefab[] {
  const itemPrefabs = documentFiles.flatMap(({ path, document }) => {
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
        itemContainer: accessor.firstChildrenFor('ItemContainer', parseItemContainer),
        component: accessor.firstChildrenFor('ItemComponent', parseItemComponent),
        meleeWeapon: accessor.firstChildrenFor('MeleeWeapon', parseMeleeWeapon),
        rangedWeapon: accessor.firstChildrenFor('RangedWeapon', parseRangedWeapon),
        projectile: accessor.firstChildrenFor('Projectile', parseProjectile),
        holdable: accessor.firstChildrenFor('Holdable', parseHoldable),
        throwable: accessor.firstChildrenFor('Throwable', parseThrowable),
        sourceXml: path,
      };
    });
    return items;
  });
  return itemPrefabs;
}

export function parseTextXml(textDocuments: Document[]): Locale[] {
  return textDocuments.map((document) => {
    const infoTextsElement = getChildrenOf(document, 'infoTexts')[0];
    const language = getAttrValue(infoTextsElement, 'language');
    const name = getAttrValue(infoTextsElement, 'translatedName');

    const searchForTag = [
      'entityname.',
      'entitydescription.',
      'displayname.',
      'afflictionname.',
      'afflictiondescription.',
    ];
    const labels: Record<string, string>[] = searchForTag.map(() => ({}));
    Array.from(infoTextsElement.children).forEach((element) => {
      const matchedTagIndex = searchForTag.findIndex((tag) => element.tagName.startsWith(tag));
      if (matchedTagIndex >= 0 && element.textContent) {
        labels[matchedTagIndex][element.tagName.substring(searchForTag[matchedTagIndex].length)] = element.textContent;
      }
    });
    const [entityNames, entityDescriptions, displayNames, afflictionNames, afflictionDescriptions] = labels;
    return {
      language,
      name,
      entityNames,
      entityDescriptions,
      displayNames,
      afflictionNames,
      afflictionDescriptions,
    } as Locale;
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

function parseItemContainer(element: Element): ItemContainer {
  const accessor = createElementValueAccessor(element);
  return {
    capacity: accessor.number('capacity'),
    maxStackSize: accessor.number('maxStackSize'),
    hideItems: accessor.boolean('hideItems'),
    canBeSelected: accessor.boolean('canBeSelected'),
    autoInteractWithContained: accessor.boolean('autoInteractWithContained'),
    msg: accessor.string('msg'),
    drawInventory: accessor.boolean('drawInventory'),
    showConditionInContainedStateIndicator: accessor.boolean('showConditionInContainedStateIndicator'),
    spawnWithId: accessor.string('spawnWithId'),
    removeContainedItemsOnDeconstruct: accessor.boolean('removeContainedItemsOnDeconstruct'),
    containedStateIndicatorStyle: accessor.string('containedStateIndicatorStyle'),
    characterUsable: accessor.boolean('characterUsable'),
    itemsPerRow: accessor.number('itemsPerRow'),
    slotsPerRow: accessor.number('slotsPerRow'),
    uiLabel: accessor.string('uiLabel'),
    containedSpriteDepths: accessor.numberArray('containedSpriteDepths'),
    autoInject: accessor.boolean('autoInject'),
    autoInjectThreshold: accessor.number('autoInjectThreshold'),
    allowSwappingContainedItems: accessor.boolean('allowSwappingContainedItems'),
    allowAccess: accessor.boolean('allowAccess'),
    canBeCombined: accessor.boolean('canBeCombined'),
    allowDragAndDrop: accessor.boolean('allowDragAndDrop'),
    containedStateIndicatorSlot: accessor.boolean('containedStateIndicatorSlot'),
    containableItems: accessor.multiChildrenFor('Containable', parseRelatedItem),
    statusEffects: accessor.multiChildrenFor('StatusEffect', parseStatusEffect),
  };
}

function parseItemComponent(element: Element): ItemComponent {
  const accessor = createElementValueAccessor(element);
  return {
    characterUsable: accessor.boolean('characterUsable'),
    statusEffects: accessor.multiChildrenFor('StatusEffect', parseStatusEffect),
  };
}

function parseMeleeWeapon(element: Element): MeleeWeapon {
  const accessor = createElementValueAccessor(element);

  const reloadValue = accessor.string('reload');
  let reloadDivisor: number | undefined;
  let reload: number | undefined;
  if (reloadValue?.startsWith('*')) {
    reloadDivisor = +reloadValue.slice(1);
  } else {
    reload = (reloadValue && +reloadValue) || undefined;
  }

  return {
    reload,
    reloadDivisor,
    range: accessor.number('range'),
    slots: accessor.stringArray('slots') as string[],
    canBeCombined: accessor.boolean('canBeCombined'),
    combatPriority: accessor.number('combatPriority'),
    msg: accessor.string('msg'),
    removeOnCombined: accessor.boolean('removeOnCombined'),
    preferredContainedItems: accessor.stringArray('preferredContainedItems'),
    aimable: accessor.boolean('aimable'),
    attack: accessor.firstChildrenFor('Attack', parseAttack),
    statusEffects: accessor.multiChildrenFor('StatusEffect', parseStatusEffect),
    requiredItem: accessor.firstChildrenFor('RequiredItem', parseRelatedItem),
    requiredSkills: accessor.multiChildrenFor('RequiredSkill', parseRequiredSkill),
  };
}

function parseRangedWeapon(element: Element): RangedWeapon {
  const accessor = createElementValueAccessor(element);
  return {
    reload: accessor.number('reload'),
    spread: accessor.number('spread'),
    unSkilledSpread: accessor.number('unSkilledSpread'),
    crossHairScale: accessor.number('crossHairScale'),
    combatPriority: accessor.number('combatPriority'),
    holdTrigger: accessor.boolean('holdTrigger'),
    maxChargeTime: accessor.number('maxChargeTime'),
    attack: accessor.firstChildrenFor('Attack', parseAttack),
    statusEffects: accessor.multiChildrenFor('StatusEffect', parseStatusEffect),
    particleEmitters: accessor.multiChildrenFor('ParticleEmitter', parseParticleEmitter),
    requiredItem: accessor.firstChildrenFor('RequiredItems', parseRelatedItem),
    requiredSkills: accessor.multiChildrenFor('RequiredSkill', parseRequiredSkill),
  };
}

function parseAttack(element: Element): Attack {
  const accessor = createElementValueAccessor(element);
  return {
    itemDamage: accessor.number('itemDamage'),
    targetImpulse: accessor.number('targetImpulse'),
    structureDamage: accessor.number('structureDamage'),
    penetration: accessor.number('penetration'),
    severLimbsProbability: accessor.number('severLimbsProbability'),
    afflictions: accessor.multiChildrenFor('Affliction', parseAffliction),
    statusEffects: accessor.multiChildrenFor('StatusEffect', parseStatusEffect),
  };
}

function parseAffliction(element: Element): Affliction {
  const accessor = createElementValueAccessor(element);
  return {
    identifier: (accessor.string('identifier') || accessor.string('type')) as AfflictionType,
    strength: accessor.number('strength') || (accessor.number('amount') as number),
    probability: accessor.number('probability'),
  };
}

function parseStatusEffect(element: Element): StatusEffect | undefined {
  const accessor = createElementValueAccessor(element);
  if (Array.from(element.children).every((children) => children.tagName.toLowerCase() === 'sound')) {
    return undefined;
  }
  return {
    type: accessor.string('type') as ActionType,
    targets: accessor.stringArray('target') as TargetType[],
    condition: accessor.number('condition'),
    disableDeltaTime: accessor.boolean('disableDeltaTime'),
    duration: accessor.number('duration'),
    tags: accessor.stringArray('tags'),
    targetItemComponent: accessor.string('targetItemComponent'),
    setValue: accessor.boolean('setValue'),
    comparison: accessor.string('comparison'),
    delay: accessor.number('delay'),
    use: !!getChildrenOf(element, 'Use').length || undefined,
    remove: !!getChildrenOf(element, 'Remove').length || !!getChildrenOf(element, 'RemoveItem').length || undefined,
    fireSize: getNumberValue(getChildrenOf(element, 'Fire')[0], 'size'),
    conditional: accessor.firstChildrenFor('Conditional', parseConditional),
    requiredItem: accessor.firstChildrenFor('RequiredItem', parseRelatedItem),
    explosion: accessor.firstChildrenFor('Explosion', parseExplosion),
    afflictions: accessor.multiChildrenFor('Affliction', parseAffliction),
    reduceAfflictions: accessor.multiChildrenFor('ReduceAffliction', parseAffliction),
    particleEmitters: accessor.multiChildrenFor('ParticleEmitter', parseParticleEmitter),
    giveSkills: accessor.multiChildrenFor('GiveSkill', parseGiveSkill),
    giveExperiences: accessor.multiChildrenFor('GiveExperience', parseGiveExperience),
  };
}

function parseConditional(element: Element): Conditional {
  const condition: Conditional = {};
  element.getAttributeNames().forEach((attrName) => {
    let value = element.getAttribute(attrName);
    if (!value) {
      return;
    }
    if (value.includes(' ')) {
      [condition.operator, value] = value.split(' ') as [ConditionOperator, string];
    }
    if (attrName.toLowerCase() === 'entityType'.toLowerCase()) {
      condition.entityType = value;
    } else if (attrName.toLowerCase() === 'condition') {
      condition.condition = +value;
    } else if (attrName.toLowerCase() === 'mess') {
      condition.mass = +value;
    } else {
      const isBoolean = value === 'true' || value === 'false';
      if (isBoolean) {
        condition[attrName] = value === 'true';
      } else {
        const numberValue = +value;
        condition[attrName] = Number.isNaN(numberValue) ? value : numberValue;
      }
    }
  });
  return condition;
}

function parseRelatedItem(element: Element): RelatedItem {
  const accessor = createElementValueAccessor(element);
  const identifier = accessor.string('identifier');
  const identifiers = accessor.stringArray('identifiers') || (identifier ? [identifier] : undefined);
  return {
    identifiers,
    items: accessor.stringArray('items'),
    excludedIdentifiers: accessor.stringArray('excludedItems') || accessor.stringArray('excludedIdentifiers'),
    type: accessor.string('type') as RelationType,
    optional: accessor.boolean('optional'),
    matchOnEmpty: accessor.boolean('matchOnEmpty'),
    excludeBroken: accessor.boolean('excludeBroken'),
    msg: accessor.string('msg'),
    statusEffects: accessor.multiChildrenFor('statusEffect', parseStatusEffect),
  };
}

function parseExplosion(element: Element): Explosion {
  const accessor = createElementValueAccessor(element);
  return {
    range: accessor.number('range') as number,
    force: accessor.number('force') as number,
    showEffects: accessor.boolean('showEffects'),
    shockwave: accessor.boolean('shockwave'),
    smoke: accessor.boolean('smoke'),
    flames: accessor.boolean('flames'),
    sparks: accessor.boolean('sparks'),
    underwaterBubble: accessor.boolean('underwaterBubble'),
    cameraShake: accessor.number('cameraShake'),
    flash: accessor.boolean('flash'),
    structureDamage: accessor.number('structureDamage'),
    applyFireEffects: accessor.boolean('applyFireEffects'),
  };
}

function parseProjectile(element: Element): Projectile {
  const accessor = createElementValueAccessor(element);
  return {
    characterUsable: accessor.boolean('characterUsable') as boolean,
    launchImpulse: accessor.number('launchImpulse'),
    impulseSpread: accessor.number('impulseSpread'),
    launchRotation: accessor.number('launchRotation'),
    stickPermanently: accessor.boolean('stickPermanently'),
    stickToCharacters: accessor.boolean('stickToCharacters'),
    stickToStructures: accessor.number('stickToStructures'),
    stickToItems: accessor.boolean('stickToItems'),
    stickToDeflective: accessor.boolean('stickToDeflective'),
    hitscan: accessor.boolean('hitscan'),
    hitScanCount: accessor.number('hitScanCount'),
    maxTargetsToHit: accessor.number('maxTargetsToHit'),
    removeOnHit: accessor.boolean('removeOnHit'),
    spread: accessor.number('spread'),
    staticSpread: accessor.boolean('staticSpread'),
    deactivationTime: accessor.number('deactivationTime'),
    inheritStatusEffectsFrom: accessor.string('inheritStatusEffectsFrom'),
    inheritRequiredSkillsFrom: accessor.string('inheritRequiredSkillsFrom'),
    penetration: accessor.number('penetration'),
    severLimbsProbability: accessor.number('severLimbsProbability'),
    attack: accessor.firstChildrenFor('Attack', parseAttack),
    statusEffects: accessor.multiChildrenFor('StatusEffect', parseStatusEffect),
    particleEmitters: accessor.multiChildrenFor('ParticleEmitter', parseParticleEmitter),
  };
}

function parseParticleEmitter(element: Element): ParticleEmitter {
  const accessor = createElementValueAccessor(element);
  return {
    particle: accessor.string('particle') as string,
    angleMin: accessor.number('angleMin'),
    angleMax: accessor.number('angleMax'),
    distanceMin: accessor.number('distanceMin'),
    distanceMax: accessor.number('distanceMax'),
    velocityMin: accessor.number('velocityMin'),
    velocityMax: accessor.number('velocityMax'),
    scaleMin: accessor.number('scaleMin'),
    scaleMax: accessor.number('scaleMax'),
    scaleMultiplier: accessor.numberArray('scaleMultiplier'),
    emitInterval: accessor.number('emitInterval'),
    particleAmount: accessor.number('particleAmount'),
    particlesPerSecond: accessor.number('particlesPerSecond'),
    emitAcrossRayInterval: accessor.number('emitAcrossRayInterval'),
    initialDelay: accessor.number('initialDelay'),
    drawOnTop: accessor.boolean('drawOnTop'),
    copyEntityAngle: accessor.boolean('copyEntityAngle'),
    colorMultiplier: accessor.numberArray('colorMultiplier'),
  };
}

function parseGiveSkill(element: Element): GiveSkill {
  const accessor = createElementValueAccessor(element);
  return { skillIdentifier: accessor.string('skillIdentifier'), amount: accessor.number('amount') } as GiveSkill;
}

function parseGiveExperience(element: Element): GiveExperience {
  const accessor = createElementValueAccessor(element);
  return { amount: accessor.number('amount') } as GiveExperience;
}

function parseThrowable(element: Element): Throwable {
  const accessor = createElementValueAccessor(element);
  return {
    slots: accessor.stringArray('slots') as string[],
    throwForce: accessor.number('throwForce') as number,
    characterUsable: accessor.boolean('characterUsable'),
    canBeCombined: accessor.boolean('canBeCombined'),
    removeOnCombined: accessor.boolean('removeOnCombined'),
    msg: accessor.string('msg'),
    statusEffects: accessor.multiChildrenFor('StatusEffect', parseStatusEffect),
  };
}

function parseHoldable(element: Element): Holdable {
  const accessor = createElementValueAccessor(element);
  return {
    slots: accessor.stringArray('slots') as string[],
    msg: accessor.string('msg'),
    controlPose: accessor.boolean('controlPose'),
    useHandRotationForHoldAngle: accessor.boolean('useHandRotationForHoldAngle'),
    selectKey: accessor.string('selectKey'),
    pickKey: accessor.string('pickKey'),
    pickingTime: accessor.number('pickingTime'),
    attachable: accessor.boolean('attachable'),
    attachedByDefault: accessor.boolean('attachedByDefault'),
    aimable: accessor.boolean('aimable'),
    canBeSelected: accessor.boolean('canBeSelected'),
    canBePicked: accessor.boolean('canBePicked'),
    canBeCombined: accessor.boolean('canBeCombined'),
    allowSwappingWhenPicked: accessor.boolean('allowSwappingWhenPicked'),
    blocksPlayers: accessor.boolean('blocksPlayers'),
    removeOnCombined: accessor.boolean('removeOnCombined'),
    characterUsable: accessor.boolean('characterUsable'),
    reAttachable: accessor.boolean('reAttachable'),
    reload: accessor.number('reload'),
    limitedAttachable: accessor.boolean('limitedAttachable'),
    requiredItems: accessor.multiChildrenFor('RequiredItem', parseRelatedItem),
    requiredSkills: accessor.multiChildrenFor('RequiredSkill', parseRequiredSkill),
    statusEffects: accessor.multiChildrenFor('StatusEffect', parseStatusEffect),
  };
}

function getFileDirectory(path: string): string {
  const lastDirectory = path.lastIndexOf('/');
  return lastDirectory > -1 ? path.substring(0, lastDirectory) : '';
}
