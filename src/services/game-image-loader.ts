import { ItemPrefab } from '@interfaces/Item-prefab';
import { mergeVariant } from '@services/game-data-parser';
import { isNotNil } from '@utils/object-utils';

export function getAllRequiredImages(items: ItemPrefab[], filesMap: Record<string, File>): Record<string, File> {
  const requiredImagesMap: Record<string, File> = {};
  const fileEntries = Object.entries(filesMap);

  const allTexturePaths = mergeVariant(items)
    .filter((item) => item.fabricationRecipes?.length || item.deconstructItems?.length || item.price)
    .flatMap((item) => [
      item.infectedIcon || item.sprite,
      ...(item.tags?.includes('ore') || item.tags?.includes('plant')
        ? [...(item.containedSprites || []), ...(item.decorativeSprite || [])]
        : []),
    ])
    .filter(isNotNil)
    .map((sprite) => sprite.texture);

  new Set(allTexturePaths).forEach((path) => {
    const targetFilePath = path.replace('Mods/', '').replace('Content/', '');
    const file = fileEntries.find(([p]) => p.match(`(^|/)${targetFilePath}`))?.[1];
    if (file) {
      requiredImagesMap[path] = file;
    }
  });

  return requiredImagesMap;
}
