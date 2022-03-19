import { RelatedItem } from '@interfaces/related-item';
import { StatusEffect } from '@interfaces/status-effect';

export interface ItemContainer {
  /**
   * How many items can be contained inside this item.
   * default: 5
   */
  capacity?: number;
  /**
   * How many items can be stacked in one slot.
   * Does not increase the maximum stack size of the items themselves,
   * e.g. a stack of bullets could have a maximum size of 8 but the number of bullets in a specific weapon could be restricted to 6.
   * default: 64
   */
  maxStackSize?: number;
  /**
   * Should the items contained inside this item be hidden.
   * If set to false, you should use the ItemPos and ItemInterval properties to determine where the items get rendered.
   * default: true
   */
  hideItems?: boolean;
  /**
   * Can the item be selected by interacting with it.
   */
  canBeSelected?: boolean;
  /**
   * If set to true, interacting with this item will make the character interact with the contained item(s), automatically picking them up if they can be picked up.
   */
  autoInteractWithContained?: boolean;
  msg?: string;
  /**
   * Should the inventory of this item be visible when the item is selected.
   * default: true
   */
  drawInventory?: boolean;
  /**
   * If enabled, the condition of this item is displayed in the indicator that would normally show the state of the contained items.
   * May be useful for items such as ammo boxes and magazines that spawn projectiles as needed,
   * and use the condition to determine how many projectiles can be spawned in total.
   */
  showConditionInContainedStateIndicator?: boolean;
  /**
   * Specify an item for the container to spawn with.
   */
  spawnWithId?: string;
  removeContainedItemsOnDeconstruct?: boolean;
  containedStateIndicatorStyle?: string;
  /**
   * Can the "Use" action of the item be triggered by characters or just other items/StatusEffects.
   */
  characterUsable?: boolean;
  /**
   * How many items are placed in a row before starting a new row.
   * default: 100
   */
  itemsPerRow?: number;
  /**
   * How many inventory slots the inventory has per row.
   * default: 5
   */
  slotsPerRow?: number;
  /**
   * An optional text displayed above the item's inventory.
   */
  uiLabel?: string;
  /**
   * Can be used to set the sprite depth individually for each contained item
   */
  containedSpriteDepths?: number[];
  /**
   * Should the items be injected into the user.
   */
  autoInject?: boolean;
  /**
   * The health threshold that the user must reach in order to activate the autoinjection.
   * default: 0.5
   */
  autoInjectThreshold?: number;
  allowSwappingContainedItems?: boolean;
  /**
   * default: true
   */
  allowAccess?: boolean;
  /**
   * Can the item be combined with other items of the same type.
   */
  canBeCombined?: boolean;
  /**
   * Allow dragging and dropping items to deposit items into this inventory.
   * default: true
   */
  allowDragAndDrop?: boolean;
  /**
   * Can be used to make the contained state indicator display the condition of the item in a specific slot even when the container's capacity is more than 1.
   */
  containedStateIndicatorSlot?: boolean;

  containableItems?: RelatedItem[];
  statusEffects?: StatusEffect[];
}
