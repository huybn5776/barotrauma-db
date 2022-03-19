import { ActionType } from '@enums/action-type';
import { AfflictionType } from '@enums/affliction-type';
import { RelationType } from '@enums/relation-type';
import { TargetType } from '@enums/target-type';
import { Attack } from '@interfaces/attack';
import { AttackEffect } from '@interfaces/attack-effect';
import { ItemContainer } from '@interfaces/item-container';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { MeleeAttackInfo } from '@interfaces/melee-attack-info';
import { MeleeWeapon } from '@interfaces/melee-weapon';
import { RangedAttackInfo } from '@interfaces/ranged-attack-info';
import { RangedWeapon } from '@interfaces/ranged-weapon';
import { WeaponAmmo } from '@interfaces/weapon-ammo';
import { WeaponViewData } from '@interfaces/weapon-view-data';
import { DataConvertContext } from '@services/data-convert-service';

const afflictionTypesToSum: AfflictionType[] = [
  AfflictionType.InternalDamage,
  AfflictionType.BluntForceTrauma,
  AfflictionType.Lacerations,
  AfflictionType.BiteWounds,
  AfflictionType.GunshotWound,
  AfflictionType.OrganDamage,
  AfflictionType.DeepTissueInjury,
  AfflictionType.Bleeding,
  AfflictionType.Burn,
  AfflictionType.Bloodloss,
  AfflictionType.OxygenLow,
  AfflictionType.SufforinPoisoning,
  AfflictionType.CyanidePoisoning,
  AfflictionType.RadiationSickness,
];

export function filterWeaponItems(items: ItemPrefab[]): ItemPrefab[] {
  const filterMeleeWeapon: (item: ItemPrefab) => boolean = (item) =>
    !item.tags?.includes('medical') && !item.tags?.includes('skillbook') && !item.tags?.includes('chem');
  return items.filter(
    (item) => item.category !== 'hidden' && ((item.meleeWeapon && filterMeleeWeapon(item)) || item.rangedWeapon),
  );
}

export function itemsToWeaponsView(items: ItemPrefab[], context: DataConvertContext): WeaponViewData[] {
  return items.flatMap((item) => {
    let melee: MeleeAttackInfo | undefined;
    if (item.meleeWeapon) {
      melee = convertAttackFromMeleeWeapon(item, context);
    }
    let ranged: RangedAttackInfo | undefined;
    if (item.rangedWeapon) {
      ranged = convertAttackFromRangedWeapon(item, context);
    }
    if (melee && (melee.structureDamage || melee.effects?.length)) {
      return [{ item, melee }] as WeaponViewData[];
    }
    if (ranged) {
      return [{ item, ranged }] as WeaponViewData[];
    }
    return [];
  });
}

export function filterEffectiveWeapons(viewDateArray: WeaponViewData[]): WeaponViewData[] {
  return viewDateArray.filter((viewData) => viewData.melee?.effects?.length || viewData.ranged?.ammoList?.length);
}

function convertAttackFromMeleeWeapon(item: ItemPrefab, context: DataConvertContext): MeleeAttackInfo | undefined {
  const melee = item.meleeWeapon;
  if (!melee || !melee.attack) {
    return undefined;
  }
  const speed = convertMeleeWeaponSpeed(item, melee, context);
  const effects: AttackEffect[] = attackToEffects(melee.attack);
  const totalEffectAmount = sumTotalEffectAmount(effects);
  return {
    twoHands: melee.slots.includes('RightHand+LeftHand'),
    speed: +speed.toFixed(2),
    range: melee.range,
    impulse: melee.attack?.targetImpulse,
    structureDamage: melee.attack?.structureDamage,
    severLimbsProbability: melee.attack?.severLimbsProbability,
    effects,
    totalEffectAmount,
  };
}

function attackToEffects(attack: Attack): AttackEffect[] {
  let effects: AttackEffect[] = [];
  if (attack?.afflictions?.length) {
    effects = [
      ...effects,
      ...attack.afflictions.map((affliction) => ({
        type: affliction.identifier,
        amount: affliction.strength,
        probability: affliction.probability,
      })),
    ];
  }
  if (attack.statusEffects?.length) {
    const effectsFromStatusEffect = attack.statusEffects
      .filter(
        (statusEffect) => statusEffect.type === ActionType.OnUse && statusEffect.targets.includes(TargetType.Character),
      )
      .flatMap(
        (statusEffect) =>
          statusEffect.afflictions?.map((affliction) => ({
            type: affliction.identifier,
            amount: affliction.strength,
            probability: affliction.probability,
          })) || [],
      );
    effects = [...effects, ...effectsFromStatusEffect];
  }
  return effects;
}

function convertMeleeWeaponSpeed(item: ItemPrefab, melee: MeleeWeapon, context: DataConvertContext): number {
  let speed = melee.reload || 0.5;
  if (item.variantOf && melee.reloadDivisor) {
    speed = (context.itemsMap[item.variantOf]?.meleeWeapon?.reload || 0) / melee.reloadDivisor || speed;
  }
  return speed;
}

function convertAttackFromRangedWeapon(item: ItemPrefab, context: DataConvertContext): RangedAttackInfo | undefined {
  const { rangedWeapon, holdable } = item;
  if (!rangedWeapon || !holdable) {
    return undefined;
  }
  const speed = rangedWeapon.reload || 1;
  const ammoList = getRangedWeaponAmmoList(item, rangedWeapon, context);

  return {
    twoHands: holdable.slots.includes('RightHand+LeftHand'),
    speed,
    spread: rangedWeapon.spread,
    unSkilledSpread: rangedWeapon.unSkilledSpread,
    recoil: rangedWeapon.statusEffects?.find((effect) => effect.type === ActionType.OnUse && effect.explosion)
      ?.explosion?.force,
    maxChargeTime: rangedWeapon.maxChargeTime,
    ammoList,
  };
}

function getRangedWeaponAmmoList(
  weaponItem: ItemPrefab,
  rangedWeapon: RangedWeapon,
  context: DataConvertContext,
): WeaponAmmo[] {
  const { itemContainer } = weaponItem;
  const requiredItems = [
    ...(rangedWeapon.requiredItem?.items || []),
    ...(rangedWeapon.requiredItem?.identifiers || []),
  ];
  if (!itemContainer || !requiredItems?.length || rangedWeapon.requiredItem?.type !== RelationType.Contained) {
    return [];
  }

  const isUseMagazine = !!rangedWeapon.statusEffects?.some((effect) => effect.type === ActionType.OnUse && effect.use);
  const containableItems = context.items.filter(
    (item) =>
      item.category !== 'hidden' &&
      (requiredItems.includes(item.identifier) || item.tags?.some((tag) => requiredItems.includes(tag))),
  );

  return containableItems.flatMap((item) => {
    return isUseMagazine ? parseMagazineAmmo(item, context) || [] : parseAmmo(item, itemContainer) || [];
  });
}

function parseMagazineAmmo(item: ItemPrefab, context: DataConvertContext): WeaponAmmo | undefined {
  const projectileItemIdentifier = item.itemContainer?.containableItems?.[0]?.items?.[0];
  const projectileItem = projectileItemIdentifier ? context.itemsMap[projectileItemIdentifier] : undefined;
  if (!projectileItem || !projectileItem.projectile?.attack) {
    return undefined;
  }
  const effects = attackToEffects(projectileItem.projectile.attack);
  const useCondition = item.itemContainer?.statusEffects?.find(
    (effect) => effect.type === ActionType.OnUse && effect.targets.includes(TargetType.This),
  )?.condition;
  if (!useCondition) {
    return undefined;
  }
  const shots = -100 / useCondition;
  const { structureDamage } = projectileItem.projectile.attack;
  const totalEffectAmount = sumTotalEffectAmount(effects);
  return { item, effects, shots, structureDamage, totalEffectAmount };
}

function parseAmmo(item: ItemPrefab, itemContainer: ItemContainer): WeaponAmmo | undefined {
  const { projectile } = item;
  if (!projectile || !projectile.attack) {
    return undefined;
  }
  const effects: AttackEffect[] = attackToEffects(projectile.attack);
  const shots = (itemContainer.capacity || 5) * (itemContainer.maxStackSize || 64);
  const { structureDamage } = projectile.attack;
  const totalEffectAmount = sumTotalEffectAmount(effects);
  return { item, effects, shots, structureDamage, totalEffectAmount };
}

function sumTotalEffectAmount(effects: AttackEffect[]): number {
  return effects
    .filter((effect) => afflictionTypesToSum.includes(effect.type))
    .reduce((acc, effect) => acc + effect.amount, 0);
}
