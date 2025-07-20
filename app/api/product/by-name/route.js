import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function POST(request) {
  try {
    const { names } = await request.json();

    if (!Array.isArray(names) || names.length === 0) {
      return NextResponse.json({ products: [] });
    }

    await connectDB();

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    

    // Find products whose name is in the given names array (case-insensitive)
    const products = await Product.find({
      name: { $in: names.map(name => new RegExp(`^${escapeRegExp(name)}$`, "i")) }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Get products by names error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
