<template>
  <div class="page-content data-import-page">
    <DateImportInstruction />

    <FileDropZone @fileDropped="onFile">
      <ToolPanel>
        <h3 class="tool-panel-header">Data importer</h3>
        <div class="tool-panel-section">
          <ToolPanelSectionHeader>Input</ToolPanelSectionHeader>
          <div class="tool-panel-items-container">
            <DataImportInput :percentageMap="percentageMap" @file="onFile" />
          </div>
        </div>

        <div class="tool-panel-section">
          <ToolPanelSectionHeader>Output</ToolPanelSectionHeader>
          <div class="tool-panel-items-container">
            <DataImportOutput :convertResult="convertResult" />
          </div>
        </div>
      </ToolPanel>
    </FileDropZone>
    <GithubFooter />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { isNil } from 'ramda';

import DataImportInput from '@components/DataImportInput/DataImportInput.vue';
import DataImportOutput from '@components/DataImportOutput/DataImportOutput.vue';
import DateImportInstruction from '@components/DateImportInstruction/DateImportInstruction.vue';
import FileDropZone from '@components/FileDropZone.vue';
import GithubFooter from '@components/GithubFooter/GithubFooter.vue';
import ToolPanel from '@components/ToolPanel/ToolPanel.vue';
import ToolPanelSectionHeader from '@components/ToolPanelSectionHeader/ToolPanelSectionHeader.vue';
import { RequiredImportType } from '@enums/required-import-type';
import { ContentPackageEntry } from '@interfaces/content-package-entry';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import { loadGameData, readXmlFile } from '@services/game-data-loader';
import { parseItemXml, parseTextXml } from '@services/game-data-parser';
import { getAllRequiredImages } from '@services/game-image-loader';
import { isNotNilOrEmpty } from '@utils/object-utils';

const loadedData = ref<{
  contentPackage?: ContentPackageEntry;
  items?: Record<string, File>;
  texts?: Record<string, File>;
}>({});
const percentageMap = ref<Partial<Record<RequiredImportType, number>>>({});
const convertResult = ref<{ items?: ItemPrefab[]; texts?: Locale[]; images?: Record<string, File> }>({});

async function onFile(files: Record<string, File>): Promise<void> {
  const { contentPackage, items, texts } = await loadGameData(files, loadedData.value.contentPackage);
  loadedData.value.contentPackage = contentPackage || loadedData.value.contentPackage;
  loadedData.value.items = { ...(items || {}), ...(loadedData.value.items || {}) };
  loadedData.value.texts = { ...(texts || {}), ...(loadedData.value.texts || {}) };

  updatePercentages();
  await checkFilesReadyAndConvert();
  if (items && convertResult.value.items?.length) {
    convertResult.value.images = await getAllRequiredImages(convertResult.value.items, files);
  }
}

function updatePercentages(): void {
  const { contentPackage, items, texts } = loadedData.value;
  let itemPercentage;
  let textPercentage;
  if (contentPackage) {
    itemPercentage = items
      ? Math.round((contentPackage.items.filter((path) => !!items[path]).length / contentPackage.items.length) * 100)
      : 0;
    textPercentage = texts
      ? Math.round((contentPackage.texts.filter((path) => !!texts[path]).length / contentPackage.texts.length) * 100)
      : 0;
  } else {
    itemPercentage = isNil(items) ? 0 : 100;
    textPercentage = isNil(texts) ? 0 : 100;
  }

  percentageMap.value = { contentPackage: contentPackage ? 100 : 0, items: itemPercentage, texts: textPercentage };
}

async function checkFilesReadyAndConvert(): Promise<void> {
  const { contentPackage, items, texts } = loadedData.value;
  if (!contentPackage) {
    return;
  }

  if (isNotNilOrEmpty(items)) {
    const itemDocuments = await Promise.all(Object.values(items).map(readXmlFile));
    const itemPrefabs = parseItemXml(itemDocuments);
    convertResult.value = { ...convertResult.value, items: itemPrefabs };
  }

  if (isNotNilOrEmpty(texts)) {
    const textDocuments = await Promise.all(Object.values(texts).map(readXmlFile));
    const locales = parseTextXml(textDocuments);
    convertResult.value = { ...convertResult.value, texts: locales };
  }
}
</script>

<style lang="scss" scoped>
@import './DataImportPage';
</style>
