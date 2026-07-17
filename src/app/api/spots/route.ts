import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";


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

    return NextResponse.json(formattedDbSpots);
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
