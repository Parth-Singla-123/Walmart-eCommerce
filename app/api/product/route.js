import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    await connectDB();

    // Fetch all products from the database
    const products = await Product.find();

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Get all products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
