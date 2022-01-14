<template>
  <div class="app">
    <ProvidersWrapper>
      <router-view />
    </ProvidersWrapper>
  </div>
</template>

<script lang="ts" setup>
import ProvidersWrapper from '@components/ProvidersWrapper/ProvidersWrapper.vue';
</script>

<style lang="scss">
@import 'App';
</style>
