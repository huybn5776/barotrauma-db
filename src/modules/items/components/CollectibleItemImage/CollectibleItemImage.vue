<template>
  <div v-if="showCollectibleImage" class="item-collectible">
    <p class="item-collectible-name">{{ item.item.name }}</p>
    <div class="item-collectible-images">
      <ItemImage
        v-for="image of item.collectibleItemImages"
        :key="image.sourceRect?.join(',')"
        class="ore-image"
        :image="image"
        :name="item.item.name"
        :height="100"
      />
    </div>
  </div>
  <button class="item-switch-button" @click="emits('toggleView')">
    <img src="/src/assets/svg/swap-horizontal.svg" alt="swap" />
  </button>
</template>

<script lang="ts" setup>
import ItemImage from '@components/ItemImage/ItemImage.vue';
import { ItemViewData } from '@interfaces/item-view-data';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ item: ItemViewData; showCollectibleImage: boolean }>();
const emits = defineEmits<{ (e: 'toggleView'): void }>();
</script>

<style lang="scss" scoped>
@import 'CollectibleItemImage';
</style>
