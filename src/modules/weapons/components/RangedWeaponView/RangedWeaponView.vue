<template>
  <div class="ranged-weapon-view">
    <div class="ranged-weapon-basic-info">
      <span v-if="ranged.twoHands">Two hands</span>
      <span>Speed: {{ ranged.speed }}s</span>
      <span v-if="ranged.maxChargeTime">Charge time: {{ ranged.maxChargeTime }}s</span>
      <span v-if="ranged.spread">Spread/unskilled: {{ ranged.spread }}/{{ ranged.unSkilledSpread }}</span>
      <span v-if="ranged.recoil">Recoil: {{ ranged.recoil }}</span>
    </div>

    <div class="ranged-weapon-ammo-list">
      <div v-for="ammo of ranged.ammoList" :key="ammo.item.identifier" class="ranged-weapon-ammo">
        <ItemImage :item="ammo.item" :size="32" />
        <div class="ranged-weapon-ammo-info">
          <span>{{ ammo.item.name }}</span>
          <span>Shots: {{ ammo.shots }}</span>
          <span v-if="ammo.structureDamage">Structure damage: {{ ammo.structureDamage }}</span>
        </div>
        <WeaponEffectList :effects="ammo.effects" :speed="ranged.speed" :totalEffectAmount="ammo.totalEffectAmount" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ItemImage from '@components/ItemImage/ItemImage.vue';
import { RangedAttackInfo } from '@interfaces/ranged-attack-info';
import WeaponEffectList from '@modules/weapons/components/WeaponEffectList/WeaponEffectList.vue';

defineProps<{ ranged: RangedAttackInfo }>();
</script>

<style lang="scss" scoped>
@import './RangedWeaponView';
@import '/src/modules/weapons/weapon-view';
</style>
