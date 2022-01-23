<template>
  <nav class="nav-bar">
    <router-link :to="{ name: 'items' }" class="nav-bar-link">Items</router-link>
    <router-link :to="{ name: 'dataImport' }" class="nav-bar-link">Data importer</router-link>
  </nav>
</template>

<style lang="scss" scoped>
@import './NavBar';
</style>
