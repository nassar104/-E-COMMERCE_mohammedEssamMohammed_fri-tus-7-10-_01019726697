import { DiscountType } from "./index.js";

/**
 * @param {number} price 
 * @param {object} discount 
 * @returns  number 
*/
export const calculateProductPrice = (price, discount) => {
  let appliedPrice = price;

  if (discount.type === DiscountType.PERCENTAGE) {
    appliedPrice = price - (price * discount.amount) / 100;
  } else if (discount.type === DiscountType.FIXED) {
    appliedPrice = price - discount.amount;
  }

  return appliedPrice;
};
