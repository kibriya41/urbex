import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Fallback mock database items when DB collection is empty
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
    lat: 38,
    lng: 45,
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
    lat: 28,
    lng: 32,
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
    lat: 44,
    lng: 55,
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
    lat: 56,
    lng: 62,
    description: "A dry, subterranean brick stormwater bypass tunnel originating from the mid-20th century. High humidity.",
  },
];

export async function GET() {
  try {
    const spotsCollection = db.collection("spots");
    const dbSpots = await spotsCollection.find({}).toArray();

    // Map DB spots to the model format used by explore/landing page
    const formattedDbSpots = dbSpots.map((spot) => ({
      id: spot._id.toString(),
      title: spot.title,
      location: spot.address, // map address to location property
      category: spot.category,
      rating: spot.rating || 5.0,
      reviewCount: spot.reviewCount || 0,
      // Use first image if exists, fallback to placeholder
      image: spot.images && spot.images.length > 0 ? spot.images[0] : "/spot-factory.png",
      riskTag: spot.riskTags && spot.riskTags.length > 0 ? spot.riskTags[0] : undefined,
      // Map coordinates to percentage ranges (between 20% and 80%) for mock map placing
      lat: spot.latitude ? Math.min(80, Math.max(20, 50 - (Number(spot.latitude) - 50) * 5)) : 50,
      lng: spot.longitude ? Math.min(80, Math.max(20, 50 + (Number(spot.longitude) - 10) * 2)) : 50,
      description: spot.description,
    }));

    // If database is empty, return our fallback seed database spots
    if (formattedDbSpots.length === 0) {
      return NextResponse.json(MOCK_FALLBACK_SPOTS);
    }

    return NextResponse.json([...formattedDbSpots, ...MOCK_FALLBACK_SPOTS]);
  } catch (err: any) {
    console.error("GET spots database error:", err);
    return NextResponse.json({ error: "Failed to retrieve spots" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, address, latitude, longitude, riskTags, images } = body;

    // Validation
    if (!title?.trim() || !description?.trim() || !category || !address?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const spotsCollection = db.collection("spots");

    const newSpot = {
      title,
      description,
      category,
      address,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      riskTags: riskTags || [],
      images: images || [], // base64 arrays
      rating: 5.0,
      reviewCount: 0,
      status: "Under Review",
      createdAt: new Date(),
    };

    const result = await spotsCollection.insertOne(newSpot);

    return NextResponse.json({
      success: true,
      spotId: result.insertedId.toString(),
    });
  } catch (err: any) {
    console.error("POST spot database error:", err);
    return NextResponse.json({ error: "Failed to submit spot" }, { status: 500 });
  }
}
