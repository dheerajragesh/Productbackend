import { body, param } from "express-validator";

export const objectIdParam = (name = "id") =>
  param(name)
    .exists()
    .withMessage(`${name} is required`)
    .isMongoId()
    .withMessage("Invalid MongoDB id");

const allowedOrderStatuses = [
  "placed",
  "shipped",
  "delivered",
  "cancelled",
];

export const placeOrderValidation = [
  body("paymentMethod")
    .optional({ nullable: true })
    .isString()
    .trim()
    .notEmpty(),

  body("address")
    .optional({ nullable: true })
    .isString()
    .trim(),

  body("items")
    .optional({ nullable: true })
    .isArray()
    .custom((arr) => {
      // validate basic structure if provided
      if (arr.length > 0) {
        for (const it of arr) {
          const q = Number(it?.quantity);
          if (it?.productId == null && it?.product == null)
            throw new Error("items must contain productId or product");
          if (Number.isNaN(q) || q < 1)
            throw new Error("items.quantity must be at least 1");
        }
      }
      return true;
    }),
];

export const getSingleOrderValidation = [objectIdParam("id")];
export const cancelOrderValidation = [objectIdParam("id")];
export const updateOrderStatusValidation = [
  objectIdParam("id"),
  body("orderStatus")
    .exists()
    .withMessage("orderStatus is required")
    .isString()
    .trim()
    .custom((v) => {
      if (!allowedOrderStatuses.includes(v)) {
        throw new Error("Invalid order status");
      }
      return true;
    }),
];

