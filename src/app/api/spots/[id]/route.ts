import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";

// Fallback mock items
const MOCK_FALLBACK_SPOTS = [
  {
    id: "1",
    title: "Verlassene Textilfabrik",
    location: "Leipzig, Germany",
    category: "abandoned building",
    rating: 4.7,
    reviewCount: 3,
    image: "/spot-factory.png",
    riskTag: "trespassing risk",
    lat: 38,
    lng: 45,
    description: "A decaying 19th-century textile factory with collapsing roofs, rusted iron machinery, and spectacular skylight shafts. Access is open through a broken side gate, but watch for crumbling concrete and floor holes.",
    images: ["/spot-factory.png"],
    riskTags: ["trespassing risk", "unstable structure"],
    address: "Leipzig Industrial District, Germany",
    latitude: "51.3396",
    longitude: "12.3731",
  },
  {
    id: "2",
    title: "Roman wall ruins",
    location: "Chester, UK",
    category: "ruins",
    rating: 4.5,
    reviewCount: 2,
    image: "/spot-ruins.png",
    lat: 28,
    lng: 32,
    description: "Deeply historical ruins of defensive walls built during Roman occupation, overgrown with moss and ivy. Safe and public access.",
    images: ["/spot-ruins.png"],
    riskTags: ["safe access"],
    address: "Chester Roman Grounds, UK",
    latitude: "53.1905",
    longitude: "-2.8916",
  },
  {
    id: "3",
    title: "Gaswerk rooftop",
    location: "Vienna, Austria",
    category: "viewpoint",
    rating: 4.9,
    reviewCount: 1,
    image: "/spot-viewpoint.png",
    riskTag: "permission needed",
    lat: 44,
    lng: 55,
    description: "An incredible viewpoint from the rusty crown of an old gasometer structure, offering a panoramic city view. Strict security, permission needed.",
    images: ["/spot-viewpoint.png"],
    riskTags: ["permission needed", "patrolled area"],
    address: "Vienna Gasometer Complex, Austria",
    latitude: "48.1851",
    longitude: "16.4194",
  },
  {
    id: "4",
    title: "Flood tunnel network",
    location: "Bucharest, Romania",
    category: "underground",
    rating: 4.3,
    reviewCount: 1,
    image: "/spot-tunnel.png",
    riskTag: "trespassing risk",
    lat: 56,
    lng: 62,
    description: "A dry, subterranean brick stormwater bypass tunnel originating from the mid-20th century. High humidity, bring flashlights.",
    images: ["/spot-tunnel.png"],
    riskTags: ["trespassing risk", "flooding hazard"],
    address: "Subterranean Bucharest Bypass, Romania",
    latitude: "44.4268",
    longitude: "26.1025",
  },
];

export async function GET(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await params;

    // 1. Try finding in MongoDB if the ID is a valid 24-character hex string
    if (ObjectId.isValid(id)) {
      const spot = await db.collection("spots").findOne({ _id: new ObjectId(id) });
      if (spot) {
        // Find reviews for this spot
        const reviews = await db
          .collection("reviews")
          .find({ spotId: id })
          .sort({ createdAt: -1 })
          .toArray();

        return NextResponse.json({
          spot: {
            id: spot._id.toString(),
            title: spot.title,
            description: spot.description,
            category: spot.category,
            address: spot.address,
            latitude: spot.latitude,
            longitude: spot.longitude,
            riskTags: spot.riskTags || [],
            images: spot.images || [],
            rating: spot.rating || 5.0,
            reviewCount: reviews.length,
          },
          reviews,
        });
      }
    }

    // 2. Fallback to mock item check
    const mockSpot = MOCK_FALLBACK_SPOTS.find((s) => s.id === id);
    if (mockSpot) {
      // Mock reviews
      const mockReviews = [
        {
          id: `rev-${id}-1`,
          userName: "Lukas Explorer",
          rating: 5,
          comment: "Breathtaking location. Visited during early morning, light was spectacular.",
          createdAt: new Date(Date.now() - 86400000 * 3),
        },
        {
          id: `rev-${id}-2`,
          userName: "Sarah Urbex",
          rating: 4,
          comment: "Super atmospheric but watch out for the rotten wood planks on the second floor.",
          createdAt: new Date(Date.now() - 86400000 * 10),
        },
      ];
      return NextResponse.json({ spot: mockSpot, reviews: mockReviews });
    }

    return NextResponse.json({ error: "Spot not found" }, { status: 404 });
  } catch (err: any) {
    console.error("GET spot error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: any }) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: req.headers });

    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || !comment?.trim()) {
      return NextResponse.json({ error: "Rating and comment are required" }, { status: 400 });
    }

    // Create review payload
    const newReview = {
      spotId: id,
      userName: session?.user?.name || "Anonymous Explorer",
      userImage: session?.user?.image || null,
      userId: session?.user?.id || null,
      rating: Number(rating),
      comment: comment,
      createdAt: new Date(),
    };

    // If spot is in MongoDB, store in reviews collection and recalculate spot avg rating
    if (ObjectId.isValid(id)) {
      await db.collection("reviews").insertOne(newReview);

      // Recalculate average rating for this spot
      const allReviews = await db.collection("reviews").find({ spotId: id }).toArray();
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await db.collection("spots").updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: allReviews.length,
          },
        }
      );
    }

    return NextResponse.json({ success: true, review: newReview });
  } catch (err: any) {
    console.error("POST review error:", err);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
