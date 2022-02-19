<template>
  <ItemBlock
    v-for="item of panelItems"
    :key="item.id"
    clickable
    :label="item.label"
    :active="!!percentageMap[item.id]"
    :percentage="percentageMap[item.id]"
    @click="item.onClick"
  />
  <button class="b-button" @click="selectFileByStep">Select</button>
  <input type="file" multiple hidden />
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

import { omit } from 'ramda';

import { RequiredImportType } from '@enums/required-import-type';
import ItemBlock from '@modules/data-importer/components/ItemBlock/ItemBlock.vue';
import { selectFile } from '@utils/file-utils';

interface ItemBlockInfo {
  id: RequiredImportType;
  label: string;
  percentage?: number;
  onClick?: () => void;
}

const props = defineProps<{ percentageMap: Partial<Record<RequiredImportType, number>> }>();
const emits = defineEmits<{ (e: 'file', value: Record<string, File>): void }>();

const panelItemsMap = ref({
  contentPackage: { label: 'Content Package', onClick: selectXmlFile } as ItemBlockInfo,
  items: { label: '/Items', onClick: selectDirectory } as ItemBlockInfo,
  texts: { label: '/Texts', onClick: selectDirectory } as ItemBlockInfo,
});

const panelItems = computed<ItemBlockInfo[]>(() =>
  Object.entries(panelItemsMap.value).map(([key, value]) => ({
    id: key as RequiredImportType,
    ...omit(['id'], value),
  })),
);

function selectXmlFile(): void {
  selectFile({ fileType: 'xml' }).then((filesMap) => emits('file', filesMap));
}

function selectDirectory(): void {
  selectFile({ multiple: true, directory: true }).then((filesMap) => emits('file', filesMap));
}

function selectFileByStep(): void {
  if (props.percentageMap.contentPackage) {
    selectDirectory();
  } else {
    selectXmlFile();
  }
}
</script>

<style lang="scss" scoped>
@import 'src/styles/common';
</style>
