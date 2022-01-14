<template>
  <NConfigProvider class="page-layout" :theme="darkTheme">
    <NMessageProvider placement="top-right">
      <NDialogProvider>
        <NLoadingBarProvider>
          <slot />
        </NLoadingBarProvider>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script lang="ts" setup>
import { darkTheme, NConfigProvider, NMessageProvider, NDialogProvider, NLoadingBarProvider } from 'naive-ui';
</script>
