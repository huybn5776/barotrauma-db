<template>
  <a
    v-if="type === LocationType.Outpost"
    class="location-link"
    href="https://barotraumagame.com/wiki/Campaign#Habitation_Outpost"
    target="_blank"
    title="Habitation"
  >
    <img class="location-image" src="/src/assets/icon/location-habitation-outpost.png" alt="Habitation" />
  </a>
  <a
    v-else-if="type === LocationType.City"
    class="location-link"
    href="https://barotraumagame.com/wiki/Campaign#Colony"
    target="_blank"
    title="Colony"
  >
    <img class="location-image" src="/src/assets/icon/location-colony.png" alt="Colony" />
  </a>
  <a
    v-else-if="type === LocationType.Research"
    class="location-link"
    href="https://barotraumagame.com/wiki/Campaign#Research_Outpost"
    target="_blank"
    title="Research"
  >
    <img class="location-image" src="/src/assets/icon/location-research-outpost.png" alt="Research" />
  </a>
  <a
    v-else-if="type === LocationType.Military"
    class="location-link"
    href="https://barotraumagame.com/wiki/Campaign#Military_Outpost"
    target="_blank"
    title="Military"
  >
    <img class="location-image" src="/src/assets/icon/location-military-outpost.png" alt="Military" />
  </a>
  <a
    v-else-if="type === LocationType.Mine"
    class="location-link"
    href="https://barotraumagame.com/wiki/Campaign#Mining_Outpost"
    target="_blank"
    title="Mining"
  >
    <img class="location-image" src="/src/assets/icon/location-mining-outpost.png" alt="Mining" />
  </a>
</template>

<script lang="ts" setup>
import { LocationType } from '@enums/location-type';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ type: LocationType }>();
</script>

<style lang="scss" scoped>
@import './LocationIcon';
</style>
