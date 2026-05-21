import mongoose from "mongoose";

const orderItemSchema =
  new mongoose.Schema({
    product: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    seller: {
      type:
        mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  });

const orderSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      items: [orderItemSchema],

      totalPrice: {
        type: Number,
        required: true,
      },

      orderStatus: {
        type: String,
        enum: [
          "placed",
          "shipped",
          "delivered",
          "cancelled",
        ],
        default: "placed",

      address: {
        type: String,
        default: "",
      },

      paymentMethod: {
        type: String,
        default: "COD",
      },
      },
    },
    {
      timestamps: true,
    }
  );

orderSchema.virtual("totalAmount").get(function () {
  return this.totalPrice;
});

orderSchema.virtual("status").get(function () {
  return this.orderStatus;
});
export const Order =
  mongoose.models.Order ||
  mongoose.model(
    "Order",
    orderSchema
  );
