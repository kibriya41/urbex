import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

/**
 * GET /api/user/profile
 * Returns the current authenticated user's profile data.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [spotsPosted, wishlistCount] = await Promise.all([
      db.collection("spots").countDocuments({ authorId: session.user.id }),
      db.collection("wishlist").countDocuments({ userId: session.user.id }),
    ]);

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name || "",
      email: user.email,
      image: user.image || null,
      role: user.role || "user",
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
      spotsPosted,
      wishlistCount,
    });
  } catch (err: any) {
    console.error("GET /api/user/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/user/profile
 * Body: { name?: string; image?: string }
 * Updates the authenticated user's name and/or profile image.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, image } = body;

    if (!name?.trim() && image === undefined) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (name?.trim()) updates.name = name.trim();
    if (image !== undefined) updates.image = image; // can be null to clear, or base64 string

    await db.collection("user").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: updates }
    );

    return NextResponse.json({ success: true, name: updates.name, image: updates.image });
  } catch (err: any) {
    console.error("PATCH /api/user/profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
