import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

/**
 * GET /api/wishlist
 * Returns an array of spotIds that the current user has wishlisted, OR
 * the full spot details if `includeSpots=true` query parameter is set.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ spotIds: [], spots: [] });
    }

    const { searchParams } = new URL(req.url);
    const includeSpots = searchParams.get("includeSpots") === "true";

    const items = await db
      .collection("wishlists")
      .find({ userId: session.user.id })
      .toArray();

    const spotIds = items.map((i) => i.spotId);

    if (!includeSpots) {
      return NextResponse.json({ spotIds });
    }

    // Resolve full spot details (DB only — no mocks)
    const resolvedSpots = [];
    for (const spotId of spotIds) {
      if (!ObjectId.isValid(spotId)) continue;
      const spot = await db.collection("spots").findOne({ _id: new ObjectId(spotId) });
      if (spot) {
        resolvedSpots.push({
          id: spot._id.toString(),
          title: spot.title,
          location: spot.address,
          category: spot.category,
          rating: spot.rating || 5.0,
          reviewCount: spot.reviewCount || 0,
          image: spot.images && spot.images.length > 0 ? spot.images[0] : "/spot-factory.png",
          riskTag: spot.riskTags && spot.riskTags.length > 0 ? spot.riskTags[0] : undefined,
          description: spot.description,
          latitude: spot.latitude ? Number(spot.latitude) : null,
          longitude: spot.longitude ? Number(spot.longitude) : null,
        });
      }
    }

    return NextResponse.json({ spotIds, spots: resolvedSpots });
  } catch (err: any) {
    console.error("GET wishlist error:", err);
    return NextResponse.json({ spotIds: [], spots: [] });
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
