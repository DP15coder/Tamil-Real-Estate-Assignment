import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "secret-key-change-in-production"
);

const DEMO_USERNAME = process.env.DEMO_USERNAME || "admin";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo123";

/**
 """
 Validates user credentials against demo credentials.
 
 Args:
     username: User's username
     password: User's password
     
 Returns:
     True if credentials are valid
 """
 */
export function _validate_credentials(username: string, password: string): boolean {
  return username === DEMO_USERNAME && password === DEMO_PASSWORD;
}

/**
 """
 Creates a JWT token for authenticated user.
 
 Args:
     username: Authenticated username
     
 Returns:
     JWT token string
 """
 */
export async function create_token(username: string): Promise<string> {
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
  
  return token;
}

/**
 """
 Verifies and decodes a JWT token.
 
 Args:
     token: JWT token to verify
     
 Returns:
     Decoded payload if valid, null otherwise
 """
 */
export async function verify_token(token: string): Promise<{ username: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { username: string };
  } catch {
    return null;
  }
}

/**
 """
 Gets the current authenticated user from cookies.
 
 Returns:
     Username if authenticated, null otherwise
 """
 */
export async function get_current_user(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");
  
  if (!token) {
    return null;
  }
  
  const payload = await verify_token(token.value);
  return payload?.username || null;
}

/**
 """
 Sets authentication cookie with JWT token.
 
 Args:
     token: JWT token to store
 """
 */
export async function set_auth_cookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

/**
 """
 Clears authentication cookie.
 """
 */
export async function clear_auth_cookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}

