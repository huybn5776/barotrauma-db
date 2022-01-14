<template>
  <header class="site-header">
    <div class="site-header-content-container">
      <router-link :to="{ name: 'home' }" class="site-logo-link">
        <h1 class="site-logo">Barotrauma DB</h1>
      </router-link>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@import './SiteHeader';
</style>
