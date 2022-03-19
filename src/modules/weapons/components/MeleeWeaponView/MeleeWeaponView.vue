<template>
  <div class="melee-weapon-view">
    <div class="melee-weapon-basic-info">
      <span v-if="melee.twoHands">Two hands</span>
      <span>Speed: {{ melee.speed }}s</span>
      <span v-if="melee.range">Range: {{ melee.range }}</span>
      <span v-if="melee.impulse">Impulse: {{ melee.impulse }}</span>
      <span v-if="melee.structureDamage">Structure damage: {{ melee.structureDamage }}</span>
      <span v-if="melee.severLimbsProbability">Severing limbs: {{ melee.severLimbsProbability }}%</span>
    </div>

    <WeaponEffectList :effects="melee.effects" :speed="melee.speed" :totalEffectAmount="melee.totalEffectAmount" />
  </div>
</template>

<script lang="ts" setup>
import { MeleeAttackInfo } from '@interfaces/melee-attack-info';
import WeaponEffectList from '@modules/weapons/components/WeaponEffectList/WeaponEffectList.vue';

defineProps<{ melee: MeleeAttackInfo }>();
</script>

<style lang="scss" scoped>
@import './MeleeWeaponView';
@import '/src/modules/weapons/weapon-view';
</style>
