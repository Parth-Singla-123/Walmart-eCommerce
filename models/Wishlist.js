import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "User",
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId, // _id of the products wishlisted
      ref: "Product",
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
