<template>
  <div
    class="item-image-container"
    :style="{ width: `${width || size || imageInfo?.width}px`, height: `${height || size || imageInfo?.height}px` }"
  >
    <img
      class="item-image"
      loading="lazy"
      :alt="name || item?.name"
      :src="imageInfo?.src"
      :style="imageInfo?.style"
      :class="{ loading: !loaded }"
      @load="loaded = true"
    />
  </div>
</template>

<script lang="ts" setup>
import { StyleValue, ref, onMounted } from 'vue';

import { provideGetLocaleFileKey } from '@/symbols';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { Rect } from '@interfaces/rect';
import { SpriteImage } from '@interfaces/sprite';
import { injectStrict } from '@utils/inject-utils';

interface ItemImageInfo {
  src: string;
  style: StyleValue;
  width: number;
  height: number;
}

const props = defineProps<{
  item?: ItemPrefab;
  image?: SpriteImage;
  size?: number;
  width?: number;
  height?: number;
  name?: string;
}>();

const loaded = ref(false);
const imageInfo = ref<ItemImageInfo>();
const getLocaleFileURL = injectStrict(provideGetLocaleFileKey);

onMounted(async () => {
  imageInfo.value = await getItemImageInfo();
});

async function getItemImageInfo(): Promise<ItemImageInfo | undefined> {
  const sprite = props.image || props.item?.infectedIcon || props.item?.sprite;
  if (!sprite) {
    console.error(`Cannot find image of item: ${props.name || props.item?.name}`);
    return undefined;
  }

  const rect = getRectFromSprite(sprite);
  if (!rect) {
    console.error(`Cannot get react from item sprite: ${props.name || props.item?.name}`);
    return undefined;
  }
  const { x, y, width: originalWidth, height: originalHeight } = rect;
  const { width, height, zoom } = calcSizeAndZoom(originalWidth, originalHeight);

  const localImage = await getLocaleFileURL(sprite.texture);
  const src = localImage || `/data-source/images/${sprite.texture}`;

  return {
    src,
    style: {
      objectPosition: `${-x}px ${-y}px`,
      width: `${originalWidth}px`,
      height: `${originalHeight}px`,
      transform: zoom ? `scale(${zoom})` : undefined,
      transformOrigin: 'center',
    },
    width,
    height,
  };
}

function calcSizeAndZoom(
  originalWidth: number,
  originalHeight: number,
): { width: number; height: number; zoom: number } {
  let width = props.width || props.size || 0;
  let height = props.height || props.size || 0;
  let zoom = 0;
  if (width && height) {
    zoom = Math.min(width / originalWidth, height / originalHeight);
  } else if (!width && !height) {
    width = originalWidth;
    height = originalHeight;
  } else if (width) {
    zoom = width / originalWidth;
    height = originalHeight * zoom;
  } else {
    zoom = height / originalHeight;
    width = originalWidth * zoom;
  }
  return { width, height, zoom };
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
