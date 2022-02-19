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

import { isNil, groupBy } from 'ramda';

import FileDropZone from '@components/FileDropZone/FileDropZone.vue';
import GithubFooter from '@components/GithubFooter/GithubFooter.vue';
import { RequiredImportType } from '@enums/required-import-type';
import { ContentPackageEntry } from '@interfaces/content-package-entry';
import { ItemPrefab } from '@interfaces/Item-prefab';
import { Locale } from '@interfaces/locale';
import DataImportInput from '@modules/data-importer/components/DataImportInput/DataImportInput.vue';
import DataImportOutput from '@modules/data-importer/components/DataImportOutput/DataImportOutput.vue';
import DateImportInstruction from '@modules/data-importer/components/DateImportInstruction/DateImportInstruction.vue';
import ToolPanel from '@modules/data-importer/components/ToolPanel/ToolPanel.vue';
import ToolPanelSectionHeader from '@modules/data-importer/components/ToolPanelSectionHeader/ToolPanelSectionHeader.vue';
import { loadGameData, readXmlFile } from '@services/game-data-loader';
import { parseItemXml, parseTextXml, mergeLocale } from '@services/game-data-parser';
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
  loadedData.value.contentPackage = mergeContentPackage(contentPackage, loadedData.value.contentPackage);
  loadedData.value.items = { ...(items || {}), ...(loadedData.value.items || {}) };
  loadedData.value.texts = { ...(texts || {}), ...(loadedData.value.texts || {}) };

  updatePercentages();
  await checkFilesReadyAndConvert();
  if (items && convertResult.value.items?.length) {
    convertResult.value.images = {
      ...(convertResult.value.images || {}),
      ...(await getAllRequiredImages(convertResult.value.items, files)),
    };
  }
}

function mergeContentPackage(
  content1: ContentPackageEntry | undefined,
  content2: ContentPackageEntry | undefined,
): ContentPackageEntry {
  const items = Array.from(new Set([...[...(content1?.items || [])], ...[...(content2?.items || [])]]));
  const texts = Array.from(new Set([...[...(content1?.texts || [])], ...[...(content2?.texts || [])]]));
  return { items, texts };
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
    const itemDocumentFiles = await Promise.all(
      Object.entries(items).map(async ([path, file]) => ({ path, document: await readXmlFile(file) })),
    );
    const itemPrefabs = parseItemXml(itemDocumentFiles);
    convertResult.value = { ...convertResult.value, items: itemPrefabs };
  }

  if (isNotNilOrEmpty(texts)) {
    const textDocuments = await Promise.all(Object.values(texts).map(readXmlFile));
    const allLocales = parseTextXml(textDocuments);
    const groupedLocales = Object.values(groupBy((locale) => locale.language, allLocales)).map((locales) =>
      locales.reduce((mergedLocale, locale) => mergeLocale(mergedLocale, locale), {} as Locale),
    );
    convertResult.value = { ...convertResult.value, texts: groupedLocales };
  }
}
</script>

<style lang="scss" scoped>
@import './DataImportPage';
</style>
