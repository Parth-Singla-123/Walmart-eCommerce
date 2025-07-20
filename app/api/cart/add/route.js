import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

export async function POST(request) {
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

    const { productId } = await request.json(); // productId is your custom string

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Find the product by your custom productId
    const product = await Product.findOne({ productId });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Store product._id in cart
    let cart = await Cart.findOne({ userId: mongoUser._id });

    if (!cart) {
      cart = new Cart({
        userId: mongoUser._id,
        items: [{ productId: product._id, quantity: 1 }],
      });
    } else {
      const existingItem = cart.items.find((item) =>
        String(item.productId) === String(product._id)
      );
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ productId: product._id, quantity: 1 });
      }
    }

    cart.updatedAt = new Date();
    await cart.save();

    // Populate product details
    await cart.populate("items.productId");

    // Return both _id and your custom productId to frontend
    const cartItems = cart.items.map(item => {
      const prod = item.productId;
      return {
        id: prod._id, // MongoDB ObjectId
        productId: prod.productId, // your custom productId
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
    });

    return NextResponse.json({ success: true, cart: cartItems });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
