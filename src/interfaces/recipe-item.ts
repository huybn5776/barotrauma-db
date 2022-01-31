import { ItemPrefab } from '@interfaces/Item-prefab';

export interface RecipeItem<T> {
  count: number;
  item: ItemPrefab;
  recipe: T[];
}
