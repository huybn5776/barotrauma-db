<template>
  <div class="effects-container">
    <div v-for="(effect, index) of effects" :key="index" class="effect">
      <AfflictionIcon :type="effect.type" />
      <span class="effect-amount">{{ effect.amount }}</span>
      <span class="effect-dps">/ {{ (effect.amount / speed).toFixed(1) }}</span>
    </div>

    <div class="effect effect-sum">
      <i class="effect-sum-icon" />
      <span>{{ totalEffectAmount }}</span>
      <span class="effect-dps">/ {{ (totalEffectAmount / speed).toFixed(1) }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import AfflictionIcon from '@components/AfflictionIcon/AfflictionIcon.vue';
import { AttackEffect } from '@interfaces/attack-effect';

defineProps<{ effects: AttackEffect[]; speed: number; totalEffectAmount: number }>();
</script>

<style lang="scss" scoped>
@import './WeaponEffectList';
</style>
