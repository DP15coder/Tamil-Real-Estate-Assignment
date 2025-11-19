import { NextRequest, NextResponse } from "next/server";
import { _validate_credentials, create_token, set_auth_cookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    // Validate credentials
    if (!_validate_credentials(validatedData.username, validatedData.password)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    // Create token
    const token = await create_token(validatedData.username);
    
    // Set cookie
    await set_auth_cookie(token);
    
    return NextResponse.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}

