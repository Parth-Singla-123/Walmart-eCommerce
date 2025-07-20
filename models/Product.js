import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true }, // to delete the cloudinary image
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  // Default MongoDB _id is already present (ObjectId)

  productId: {
    type: String, // or Number if you prefer numeric IDs
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  images: [imageSchema],
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  details: {
    type: String,
    trim: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Product || mongoose.model("Product", productSchema);
