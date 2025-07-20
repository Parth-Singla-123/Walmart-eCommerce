import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

export async function GET(request) {
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

    // Populate product details in each cart item
    const cart = await Cart.findOne({ userId: mongoUser._id }).populate("items.productId");

    if (!cart || !cart.items.length) {
      return NextResponse.json({ cart: [] });
    }

    // Normalize output
    const cartItems = cart.items.map(item => {
      const product = item.productId;
      // Defensive: if product is not populated, skip this item
      if (!product) return null;
      return {
        id: product._id,                  // MongoDB ObjectId
        productId: product.productId,     // Your custom product code (string)
        name: product.name,
        image: product.images?.[0]?.url || "",
        description: product.details || "",
        price: product.price,
        brand: product.brand,
        category: product.category,
        inStock: product.stock > 0,
        stock: product.stock,
        quantity: item.quantity,
      };
    }).filter(Boolean); // Remove any nulls if product was not populated

    return NextResponse.json({ cart: cartItems });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
