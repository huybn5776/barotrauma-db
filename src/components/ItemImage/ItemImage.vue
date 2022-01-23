<template>
  <div class="item-image-container" :style="{ width: `${size}px`, height: `${size}px` }">
    <img class="item-image" loading="lazy" :alt="item.name" :src="imageInfo?.src" :style="imageInfo?.style" />
  </div>
</template>

<script lang="ts" setup>
import { StyleValue, computed } from 'vue';

import { ItemPrefab } from '@interfaces/Item-prefab';
import { Rect } from '@interfaces/rect';
import { SpriteImage } from '@interfaces/sprite';

interface ItemImageInfo {
  src?: string;
  style?: StyleValue;
}

const props = defineProps<{ item: ItemPrefab; size?: number }>();
const size = props.size || 64;

const imageInfo = computed(() => getItemImageInfo(props.item));

function getItemImageInfo(item: ItemPrefab): ItemImageInfo | undefined {
  const sprite = item.infectedIcon || item.sprite;
  if (!sprite) {
    console.error(`Cannot find image of item: ${item.identifier} ${item.englishName || item.name}`);
    return undefined;
  }

  const rect = getRectFromSprite(sprite);
  if (!rect) {
    console.error(`Cannot get react from item sprite: ${item.identifier} ${item.englishName || item.name}`);
    return undefined;
  }
  const { x, y, width, height } = rect;
  const targetSize = props.size || 64;
  const zoom = Math.min(targetSize / width, targetSize / height);

  return {
    src: `/data-source/images/${sprite?.texture}`,
    style: {
      objectPosition: `${-x}px ${-y}px`,
      width: `${width}px`,
      height: `${height}px`,
      transform: `scale(${zoom})`,
      transformOrigin: 'center',
    },
  };
}

function getRectFromSprite(sprite: SpriteImage): Rect | undefined {
  if (sprite.sourceRect) {
    const [x, y, width, height] = sprite.sourceRect;
    return { x, y, width, height };
  }
  if (sprite.sheetIndex && sprite.sheetElementSize) {
    const [width, height] = sprite.sheetElementSize;
    const x = width * sprite.sheetIndex[0];
    const y = width * sprite.sheetIndex[1];
    return { x, y, width, height };
  }
  return undefined;
}
</script>

<style lang="scss" scoped>
@import './ItemImage';
</style>
