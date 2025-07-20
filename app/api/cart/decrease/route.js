import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Cart from "@/models/Cart";
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

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const cart = await Cart.findOne({ userId: mongoUser._id });
    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex((item) =>
      item.productId.equals(productId)
    );
    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Product not in cart" },
        { status: 400 }
      );
    }

    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      cart.items.splice(itemIndex, 1);
    }

    cart.updatedAt = new Date();
    await cart.save();

    // Populate product details
    await cart.populate("items.productId");

    // Normalize output (same as add-to-cart)
    const cartItems = cart.items
      .map(item => {
        const prod = item.productId;
        if (!prod) return null;
        return {
          id: prod._id,
          productId: prod.productId,
          name: prod.name,
          image: prod.images?.[0]?.url || "",
          description: prod.details || "",
          price: prod.price,
          brand: prod.brand,
          category: prod.category,
          inStock: prod.stock > 0,
          stock: prod.stock,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ success: true, cart: cartItems });
  } catch (error) {
    console.error("Decrease quantity error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
