<template>
  <NConfigProvider class="page-layout" :theme="darkTheme">
    <NMessageProvider placement="top-right" :container-style="{ marginRight: '16px' }">
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
