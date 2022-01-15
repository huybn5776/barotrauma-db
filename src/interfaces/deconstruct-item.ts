export interface DeconstructItem {
  identifier: string;
  /**
   * minCondition does <= check, meaning that below or equal to min condition will be skipped.
   */
  minCondition: number;
  /**
   * maxCondition does > check, meaning that above this max the deconstruct item will be skipped.
   */
  maxCondition: number;
  /**
   * Condition of item on creation
   */
  outConditionMin: number;
  outConditionMax: number;
  /**
   * should the condition of the deconstructed item be copied to the output items
   */
  copyCondition: boolean;
  /**
   * tag/identifier of the deconstructor(s) that can be used to deconstruct the item into this
   */
  requiredDeconstructor: string;
  /**
   * tag/identifier of other item(s) that that need to be present in the deconstructor to deconstruct the item into this
   */
  requiredOtherItem: string;
}
