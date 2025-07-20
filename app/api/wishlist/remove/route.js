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

    // Find the product by custom productId (string)
    const product = await Product.findOne({ productId });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const wishlist = await Wishlist.findOne({ userId: mongoUser._id });
    if (!wishlist) {
      return NextResponse.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }

    // Compare ObjectId as string to product._id as string
    const index = wishlist.products.findIndex(
      (p) => String(p) === String(product._id)
    );
    if (index === -1) {
      return NextResponse.json(
        { error: "Product not in wishlist" },
        { status: 400 }
      );
    }

    wishlist.products.splice(index, 1);
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
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
