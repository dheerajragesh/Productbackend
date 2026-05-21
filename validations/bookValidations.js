import { body, param } from "express-validator";

export const objectIdParam = (name = "id") =>
  param(name)
    .exists()
    .withMessage(`${name} is required`)
    .isMongoId()
    .withMessage("Invalid MongoDB id");

export const addBookValidation = [
  body("title")
    .optional({ nullable: true })
    .isString()
    .trim()
    .notEmpty(),

  body("name")
    .optional({ nullable: true })
    .isString()
    .trim()
    .notEmpty(),

  body("description")
    .optional({ nullable: true })
    .isString()
    .trim()
    .notEmpty(),

  body("details")
    .optional({ nullable: true })
    .isString()
    .trim()
    .notEmpty(),

  body("price")
    .exists()
    .withMessage("price is required")
    .custom((v) => {
      const n = Number(v);
      if (Number.isNaN(n)) throw new Error("price must be a number");
      return true;
    }),

  body("page_count")
    .optional({ nullable: true })
    .custom((v) => {
      const n = Number(v);
      if (Number.isNaN(n)) throw new Error("page_count must be a number");
      if (n < 0) throw new Error("page_count cannot be negative");
      return true;
    }),

  body("stock")
    .optional({ nullable: true })
    .custom((v) => {
      const n = Number(v);
      if (Number.isNaN(n)) throw new Error("stock must be a number");
      if (n < 0) throw new Error("stock cannot be negative");
      return true;
    }),
];

export const updateBookValidation = [
  objectIdParam("id"),
  body("title")
    .optional({ nullable: true })
    .isString()
    .trim()
    .notEmpty(),

  body("name")
    .optional({ nullable: true })
    .isString()
    .trim()
    .notEmpty(),

  body("description")
    .optional({ nullable: true })
    .isString()
    .trim()
    .notEmpty(),

  body("details")
    .optional({ nullable: true })
    .isString()
    .trim()
    .notEmpty(),

  body("price")
    .optional({ nullable: true })
    .custom((v) => {
      const n = Number(v);
      if (Number.isNaN(n)) throw new Error("price must be a number");
      return true;
    }),

  body("page_count")
    .optional({ nullable: true })
    .custom((v) => {
      const n = Number(v);
      if (Number.isNaN(n)) throw new Error("page_count must be a number");
      if (n < 0) throw new Error("page_count cannot be negative");
      return true;
    }),

  body("stock")
    .optional({ nullable: true })
    .custom((v) => {
      const n = Number(v);
      if (Number.isNaN(n)) throw new Error("stock must be a number");
      if (n < 0) throw new Error("stock cannot be negative");
      return true;
    }),
];

