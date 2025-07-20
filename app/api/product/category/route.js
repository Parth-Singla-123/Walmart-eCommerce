import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    // Get the "category" query parameter from the URL
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    if (!category) {
      return NextResponse.json(
        { error: "Category query parameter is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find products by category (case-insensitive)
    const products = await Product.find({
      category: { $regex: new RegExp(`^${category}$`, "i") }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Get products by category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
