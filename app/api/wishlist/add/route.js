import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";

export async function PATCH(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const mongoUser = await User.findOne({ supabaseId: user.id });
    if (!mongoUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Find product by custom productId (string)
    const product = await Product.findOne({ productId });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let wishlist = await Wishlist.findOne({ userId: mongoUser._id });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: mongoUser._id,
        products: [product._id],
      });
    } else {
      if (!wishlist.products.some(pid => String(pid) === String(product._id))) {
        wishlist.products.push(product._id);
      }
    }

    wishlist.updatedAt = new Date();
    await wishlist.save();

    // Populate products for the response
    await wishlist.populate("products");

    // Normalize response
    const wishlistItems = wishlist.products.map(prod => ({
      id: prod._id,
      productId: prod.productId,
      name: prod.name,
      image: prod.images?.[0]?.url || "",
      price: prod.price,
      brand: prod.brand,
      category: prod.category,
      inStock: prod.stock > 0,
      stock: prod.stock,
    }));

    return NextResponse.json({ success: true, wishlist: wishlistItems });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
