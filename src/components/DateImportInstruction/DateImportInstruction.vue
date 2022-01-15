<template>
  <details class="instruction">
    <summary>Instruction</summary>
    <p>Please find the game resources directory, drop or select the needed files into the data importer below.</p>
    <p>For Windows: C:\Program Files (x86)\Steam\steamapps\common\Barotrauma\</p>
    <p>For macOS: ~/Library/ApplicationSupport/Steam/steamapps/common/Barotrauma/Barotrauma.app/contents/MacOS</p>
    <ul>
      <li>Content Package: <code>/Data/ContentPackages/Vanilla x.x.xml</code></li>
      <li>Items: <code>/Content/Items</code></li>
      <li>Texts: <code>/Content/Texts</code></li>
    </ul>
    <p>
      You can select the entire <code>/Data</code> and <code>/Content</code> directory at once, or select Content
      Package file first and then select other files. Importer will start convert once the all needed are ready.
    </p>
  </details>
</template>

<style lang="scss" scoped>
@import './DateImportInstruction';
</style>
