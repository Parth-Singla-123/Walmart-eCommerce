import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Wishlist from "@/models/Wishlist";
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
  
      // Populate product details
      const wishlist = await Wishlist.findOne({ userId: mongoUser._id }).populate("products");
  
      if (!wishlist || !wishlist.products.length) {
        return NextResponse.json({ wishlist: [] });
      }
  
      // Normalize output
      const wishlistItems = wishlist.products.map(product => ({
        id: product._id,
        productId: product.productId,
        name: product.name,
        image: product.images?.[0]?.url || "",
        description: product.details || "",
        price: product.price,
        brand: product.brand,
        category: product.category,
        inStock: product.stock > 0,
        // No quantity field for wishlist
      }));
  
      return NextResponse.json({ wishlist: wishlistItems });
    } catch (error) {
      console.error("Get wishlist error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
  