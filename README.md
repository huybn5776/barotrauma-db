# Barotrauma DB

An Item query website for [Barotrauma](https://store.steampowered.com/app/602960/Barotrauma/) game.

## Features

- Recipe/Deconstruct items.
- Gain/Usage query to easier find out how to get some item or where it can be used.
- Sort by price to find the cheapest item to deconstruct into the material you want.
- Show ore/plant collectable state image, to  allows you to identify it before touching on it or leaving of your submarine.
- Import game mod data to query with mod item (in page: Data importer).
- Display the item name in specific language along with original english name.

## Implementation detail

### [File drag and drop](https://github.com/huybn5776/barotrauma-db/tree/main/src/utils/file-utils.ts)

To read all files under selected directory without use ` <input type="file"> to select file one by one.

### [Archive images to zip](https://github.com/huybn5776/barotrauma-db/tree/main/src/components/DataImportOutput/DataImportOutput.vue)

Use high performance library [fflate](https://github.com/101arrowz/fflate) to bundle the data importer outputs as zip for download.

### [Lazy render with IntersectionObserver](https://github.com/huybn5776/barotrauma-db/tree/main/src/compositions/use-lazy-render.ts)

Render a lot of row at once may cause browser lag for seconds, even thought fetch those static data is very fast that lazy load may not be required, we still need a way to render lazily to prevent this laggy.

The approach used here is keep track which row is entered into the visible area with IntersectionObserver, then render some amount of rows (currently is 10 rows) when near the end of the list.

In case when the user scrolls to the bottom without let some rows intersect into the viewport, the placeholder on the bottom of list (that take the remaining height) will enter into view port, trigger an action to render all items. It will still be laggy by the way.

### [Store images with IndexedDb](https://github.com/huybn5776/barotrauma-db/tree/main/src/services/locale-data-source-service.ts)

[idb](https://github.com/jakearchibald/idb) is used here to interact with IndexedDb. The usage here is to store game mod data that may contain some image for their items, without push to some server.

If we only need to handle item data without images, then we can just store those data into localstorage as easier approaching, but we can't store image into localstorage otherwise it will mose likely exceed the [5MB limitation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) for localstorage. So, why don't use IndexedDb that have more storage capacity? Its have almost unlimited capacity that enough for a lot of mods data.







