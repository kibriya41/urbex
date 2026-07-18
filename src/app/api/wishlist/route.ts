import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

import { ObjectId } from "mongodb";

// Mock Fallback Database Items matching those in api/spots/route.ts
const MOCK_FALLBACK_SPOTS = [
  {
    id: "mock-1",
    title: "Verlassene Textilfabrik",
    location: "Leipzig, Germany",
    category: "abandoned building",
    rating: 4.7,
    reviewCount: 38,
    image: "/spot-factory.png",
    riskTag: "trespassing risk",
    latitude: 51.3397,
    longitude: 12.3731,
    description: "A decaying 19th-century textile factory with collapsing roofs, rusted iron machinery, and spectacular skylight shafts.",
  },
  {
    id: "mock-2",
    title: "Roman wall ruins",
    location: "Chester, UK",
    category: "ruins",
    rating: 4.5,
    reviewCount: 61,
    image: "/spot-ruins.png",
    latitude: 53.1934,
    longitude: -2.8931,
    description: "Deeply historical ruins of defensive walls built during Roman occupation, overgrown with moss and ivy.",
  },
  {
    id: "mock-3",
    title: "Gaswerk rooftop",
    location: "Vienna, Austria",
    category: "viewpoint",
    rating: 4.9,
    reviewCount: 24,
    image: "/spot-viewpoint.png",
    riskTag: "permission needed",
    latitude: 48.2082,
    longitude: 16.3738,
    description: "An incredible viewpoint from the rusty crown of an old gasometer structure, offering a panoramic city view.",
  },
  {
    id: "mock-4",
    title: "Flood tunnel network",
    location: "Bucharest, Romania",
    category: "underground",
    rating: 4.3,
    reviewCount: 19,
    image: "/spot-tunnel.png",
    riskTag: "trespassing risk",
    latitude: 44.4396,
    longitude: 26.1012,
    description: "A dry, subterranean brick stormwater bypass tunnel originating from the mid-20th century. High humidity.",
  },
];

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

    // Resolve full spot details
    const resolvedSpots = [];
    for (const spotId of spotIds) {
      if (ObjectId.isValid(spotId)) {
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
      } else {
        // Mock spots resolution
        // Handle both "1", "2" and "mock-1", "mock-2" formats
        let normalizedId = spotId;
        if (spotId === "1") normalizedId = "mock-1";
        if (spotId === "2") normalizedId = "mock-2";
        if (spotId === "3") normalizedId = "mock-3";
        if (spotId === "4") normalizedId = "mock-4";

        const mockSpot = MOCK_FALLBACK_SPOTS.find((s) => s.id === normalizedId);
        if (mockSpot) {
          resolvedSpots.push(mockSpot);
        }
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
