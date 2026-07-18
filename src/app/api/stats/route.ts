import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/stats
 * Returns live site-wide statistics: total spots, total users, unique cities.
 */
export async function GET() {
  try {
    const [spotCount, userCount, categoryCounts, addressDocs] = await Promise.all([
      db.collection("spots").countDocuments(),
      db.collection("user").countDocuments(),
      db.collection("spots").aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]).toArray(),
      db.collection("spots").distinct("address"),
    ]);

    // Build per-category counts
    const byCategory: Record<string, number> = {};
    for (const doc of categoryCounts) {
      if (doc._id) byCategory[doc._id as string] = doc.count;
    }

    // Unique city count: treat each distinct address as a city
    const uniqueCities = new Set(
      (addressDocs as string[])
        .filter(Boolean)
        .map((addr) => {
          // Try to extract city part (last segment before country, or first comma segment)
          const parts = addr.split(",").map((p: string) => p.trim());
          return parts.length >= 2 ? parts[parts.length - 2] : parts[0];
        })
    ).size;

    return NextResponse.json({
      spotCount,
      userCount,
      cityCount: uniqueCities,
      byCategory,
    });
  } catch (err: any) {
    console.error("GET /api/stats error:", err);
    // Return zeros rather than failing the page
    return NextResponse.json({
      spotCount: 0,
      userCount: 0,
      cityCount: 0,
      byCategory: {},
    });
  }
}
