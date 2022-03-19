<template>
  <a class="affliction-link" target="_blank" :href="url" :title="title">
    <img class="affliction-image" :src="imgSrc" :alt="title" />
  </a>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';

import { AfflictionType } from '@enums/affliction-type';
import { provideLocaleTextKey } from '@symbols';
import { injectStrict } from '@utils/inject-utils';

const props = defineProps<{ type: AfflictionType }>();

const locale = injectStrict(provideLocaleTextKey);

const imgSrc = ref();
const title = ref<string>();
const url = ref<string>();

onMounted(async () => {
  const affliction = getAffliction();
  url.value = `https://barotraumagame.com/wiki/${affliction[0]}`;
  imgSrc.value = (await affliction[1]).default;
  title.value = locale.value?.afflictionNames[props.type];
});

function getAffliction(): [string, Promise<{ default: string }>] {
  switch (props.type) {
    case AfflictionType.InternalDamage:
      return ['Internal_Damage', import('@/assets/icon/affliction-internal-damage.png')];
    case AfflictionType.BluntForceTrauma:
      return ['Internal_Damage#Blunt_Force_Trauma', import('@/assets/icon/affliction-blunt-force-trauma.png')];
    case AfflictionType.Lacerations:
      return ['Internal_Damage#Lacerations', import('@/assets/icon/affliction-lacerations.png')];
    case AfflictionType.BiteWounds:
      return ['Internal_Damage#Bite_Wounds', import('@/assets/icon/affliction-bite-wounds.png')];
    case AfflictionType.GunshotWound:
      return ['Internal_Damage#Gunshot_Wound', import('@/assets/icon/affliction-gunshot-wound.png')];
    case AfflictionType.OrganDamage:
      return ['Internal_Damage#Organ_Damage', import('@/assets/icon/affliction-organ-damage.png')];
    case AfflictionType.DeepTissueInjury:
      return ['Internal_Damage#Deep_Tissue_Injury', import('@/assets/icon/affliction-deep-tissue-injury.png')];
    case AfflictionType.Bleeding:
      return ['Bleeding', import('@/assets/icon/affliction-bleeding.png')];
    case AfflictionType.Burn:
      return ['Burn', import('@/assets/icon/affliction-burn.png')];
    case AfflictionType.Bloodloss:
      return ['Bloodloss', import('@/assets/icon/affliction-bloodloss.png')];
    case AfflictionType.Stun:
      return ['Stun', import('@/assets/icon/affliction-stun.png')];
    case AfflictionType.ProgressiveStun:
      return ['ProgressiveStun', import('@/assets/icon/affliction-stun.png')];
    case AfflictionType.OxygenLow:
      return ['Oxygen_Low', import('@/assets/icon/affliction-oxygen-low.png')];
    case AfflictionType.HuskInfection:
      return ['Husk_Infection', import('@/assets/icon/affliction-husk-infection.png')];
    case AfflictionType.Paralysis:
      return ['Paralysis', import('@/assets/icon/affliction-paralysis.png')];
    case AfflictionType.MorbusinePoisoning:
      return ['Morbusine_Poisoning', import('@/assets/icon/affliction-morbusine-poisoning.png')];
    case AfflictionType.SufforinPoisoning:
      return ['Sufforin_Poisoning', import('@/assets/icon/affliction-morbusine-poisoning.png')];
    case AfflictionType.DeliriuminePoisoning:
      return ['Deliriumine_Poisoning', import('@/assets/icon/affliction-morbusine-poisoning.png')];
    case AfflictionType.CyanidePoisoning:
      return ['Cyanide_Poisoning', import('@/assets/icon/affliction-morbusine-poisoning.png')];
    case AfflictionType.RadiationSickness:
      return ['Radiation_Sickness', import('@/assets/icon/affliction-radiation-sickness.png')];
    case AfflictionType.Psychosis:
      return ['Psychosis', import('@/assets/icon/affliction-psychosis.png')];
    case AfflictionType.Drunk:
      return ['Drunk', import('@/assets/icon/affliction-drunk.png')];
    case AfflictionType.Nausea:
      return ['Nausea', import('@/assets/icon/affliction-nausea.png')];
    case AfflictionType.Hallucinating:
      return ['Hallucinating', import('@/assets/icon/affliction-hallucinating.png')];
    default:
      return [props.type, Promise.resolve({ default: props.type })];
  }
}
</script>

<style lang="scss" scoped>
@import './AfflictionIcon';
</style>
