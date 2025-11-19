import { NextResponse } from "next/server";
import { clear_auth_cookie } from "@/lib/auth";

export async function POST() {
  try {
    await clear_auth_cookie();
    
    return NextResponse.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

