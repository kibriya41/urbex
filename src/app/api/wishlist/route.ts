import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/**
 * GET /api/wishlist
 * Returns an array of spotIds that the current user has wishlisted.
 * Returns [] if not authenticated.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ spotIds: [] });
    }

    const items = await db
      .collection("wishlists")
      .find({ userId: session.user.id })
      .project({ spotId: 1 })
      .toArray();

    return NextResponse.json({ spotIds: items.map((i) => i.spotId) });
  } catch (err: any) {
    console.error("GET wishlist error:", err);
    return NextResponse.json({ spotIds: [] });
  }
}

/**
 * POST /api/wishlist
 * Body: { spotId: string }
 * Toggles a wishlist entry: adds if absent, removes if present.
 * Returns { wishlisted: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { spotId } = body;

    if (!spotId) {
      return NextResponse.json({ error: "spotId is required" }, { status: 400 });
    }

    const collection = db.collection("wishlists");
    const existing = await collection.findOne({
      userId: session.user.id,
      spotId,
    });

    if (existing) {
      // Remove from wishlist
      await collection.deleteOne({ userId: session.user.id, spotId });
      return NextResponse.json({ wishlisted: false });
    } else {
      // Add to wishlist
      await collection.insertOne({
        userId: session.user.id,
        spotId,
        createdAt: new Date(),
      });
      return NextResponse.json({ wishlisted: true });
    }
  } catch (err: any) {
    console.error("POST wishlist error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
