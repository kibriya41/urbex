"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

// Helper to verify admin/moderator role server-side
async function verifyAdminRole() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  
  if (!session || !session.user) {
    throw new Error("Authentication required.");
  }
  
  const role = session.user.role;
  if (role !== "admin" && role !== "moderator") {
    throw new Error("Access denied. Admin or Moderator privileges required.");
  }
  
  return {
    adminId: session.user.id,
    adminName: session.user.name || "System Admin",
    role: role,
  };
}

// Helper to log admin actions
async function logAdminAction(
  adminId: string,
  adminName: string,
  action: string,
  targetType: string,
  targetId: string,
  note: string
) {
  try {
    await db.collection("audit_logs").insertOne({
      adminId,
      adminName,
      action,
      targetType,
      targetId,
      note,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

// OVERVIEW ACTIONS
export async function getAdminOverview() {
  await verifyAdminRole();

  try {
    // Pending review spots (status = "Under Review" or similar)
    const pendingSpotsCount = await db
      .collection("spots")
      .countDocuments({ status: "Under Review", deletedAt: null });

    // Open reports
    const openReportsCount = await db
      .collection("reports")
      .countDocuments({ status: "open" });

    // Total active users
    const totalUsersCount = await db
      .collection("user")
      .countDocuments({});

    // Total active spots
    const totalSpotsCount = await db
      .collection("spots")
      .countDocuments({ deletedAt: null });

    // New signups this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    // Better-auth default createdAt field is usually a Date or string.
    const newSignupsCount = await db
      .collection("user")
      .countDocuments({
        createdAt: { $gte: oneWeekAgo }
      });

    // Recent activity table logs (limit to 10)
    const auditLogs = await db
      .collection("audit_logs")
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    // Map logs to clean object format
    const formattedLogs = auditLogs.map((log) => ({
      id: log._id.toString(),
      adminName: log.adminName,
      action: log.action,
      targetType: log.targetType,
      targetId: log.targetId,
      note: log.note,
      timestamp: log.timestamp.toISOString(),
    }));

    return {
      pendingSpotsCount,
      openReportsCount,
      totalUsersCount,
      totalSpotsCount,
      newSignupsCount,
      recentActivity: formattedLogs,
    };
  } catch (error: any) {
    console.error("getAdminOverview error:", error);
    throw new Error(error.message || "Failed to fetch overview data.");
  }
}

// MODERATION QUEUE ACTIONS
export async function getModerationQueue() {
  await verifyAdminRole();

  try {
    const spots = await db
      .collection("spots")
      .find({ status: "Under Review", deletedAt: null })
      .sort({ createdAt: -1 })
      .toArray();

    return spots.map((spot) => ({
      id: spot._id.toString(),
      title: spot.title,
      description: spot.description,
      category: spot.category,
      address: spot.address,
      latitude: spot.latitude,
      longitude: spot.longitude,
      riskTags: spot.riskTags || [],
      images: spot.images || [],
      createdAt: spot.createdAt ? spot.createdAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error("getModerationQueue error:", error);
    throw new Error("Failed to load moderation queue.");
  }
}

export async function approveSpot(spotId: string) {
  const admin = await verifyAdminRole();

  try {
    await db.collection("spots").updateOne(
      { _id: new ObjectId(spotId) },
      { $set: { status: "Active", updatedAt: new Date() } }
    );

    await logAdminAction(
      admin.adminId,
      admin.adminName,
      "approve_spot",
      "spot",
      spotId,
      `Approved spot status to Active.`
    );

    revalidatePath("/admin");
    revalidatePath("/admin/moderation");
    revalidatePath("/explore");
    return { success: true };
  } catch (error: any) {
    console.error("approveSpot error:", error);
    throw new Error("Failed to approve spot.");
  }
}

export async function rejectSpot(spotId: string, reason: string) {
  const admin = await verifyAdminRole();

  try {
    await db.collection("spots").updateOne(
      { _id: new ObjectId(spotId) },
      { $set: { status: "Rejected", updatedAt: new Date() } }
    );

    await logAdminAction(
      admin.adminId,
      admin.adminName,
      "reject_spot",
      "spot",
      spotId,
      `Rejected spot. Reason: ${reason}`
    );

    revalidatePath("/admin");
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error: any) {
    console.error("rejectSpot error:", error);
    throw new Error("Failed to reject spot.");
  }
}

export async function bulkApproveSpots(spotIds: string[]) {
  const admin = await verifyAdminRole();

  try {
    const objectIds = spotIds.map((id) => new ObjectId(id));
    await db.collection("spots").updateMany(
      { _id: { $in: objectIds } },
      { $set: { status: "Active", updatedAt: new Date() } }
    );

    for (const spotId of spotIds) {
      await logAdminAction(
        admin.adminId,
        admin.adminName,
        "approve_spot_bulk",
        "spot",
        spotId,
        `Approved via bulk action.`
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/moderation");
    revalidatePath("/explore");
    return { success: true };
  } catch (error: any) {
    console.error("bulkApproveSpots error:", error);
    throw new Error("Failed bulk approval.");
  }
}

export async function bulkRejectSpots(spotIds: string[], reason: string) {
  const admin = await verifyAdminRole();

  try {
    const objectIds = spotIds.map((id) => new ObjectId(id));
    await db.collection("spots").updateMany(
      { _id: { $in: objectIds } },
      { $set: { status: "Rejected", updatedAt: new Date() } }
    );

    for (const spotId of spotIds) {
      await logAdminAction(
        admin.adminId,
        admin.adminName,
        "reject_spot_bulk",
        "spot",
        spotId,
        `Rejected via bulk action. Reason: ${reason}`
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/moderation");
    return { success: true };
  } catch (error: any) {
    console.error("bulkRejectSpots error:", error);
    throw new Error("Failed bulk rejection.");
  }
}

// REPORTS ACTIONS
export async function getReports(statusFilter?: string) {
  await verifyAdminRole();

  try {
    const query: any = {};
    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }

    const reports = await db
      .collection("reports")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return reports.map((report) => ({
      id: report._id.toString(),
      type: report.type,
      targetId: report.targetId,
      reporterName: report.reporterName || "Anonymous Reporter",
      reason: report.reason,
      details: report.details || "",
      status: report.status || "open", // open, resolved, dismissed
      createdAt: report.createdAt ? report.createdAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error("getReports error:", error);
    throw new Error("Failed to retrieve reports.");
  }
}

export async function takeReportAction(
  reportId: string,
  actionType: "remove_content" | "warn_user" | "suspend_user" | "ban_user" | "dismiss",
  targetUserId: string | null,
  spotId: string | null
) {
  const admin = await verifyAdminRole();

  try {
    // 1. Update report status
    const status = actionType === "dismiss" ? "dismissed" : "resolved";
    await db.collection("reports").updateOne(
      { _id: new ObjectId(reportId) },
      { $set: { status, resolvedAt: new Date(), resolvedBy: admin.adminId } }
    );

    // 2. Perform target operation
    if (actionType === "remove_content" && spotId) {
      // Soft delete spot
      await db.collection("spots").updateOne(
        { _id: new ObjectId(spotId) },
        { $set: { deletedAt: new Date(), updatedAt: new Date() } }
      );
      await logAdminAction(
        admin.adminId,
        admin.adminName,
        "remove_content_spot",
        "spot",
        spotId,
        `Removed content via report action.`
      );
    } else if (actionType === "warn_user" && targetUserId) {
      await logAdminAction(
        admin.adminId,
        admin.adminName,
        "warn_user",
        "user",
        targetUserId,
        `Issued user warning due to community report.`
      );
    } else if (actionType === "suspend_user" && targetUserId) {
      await db.collection("user").updateOne(
        { _id: targetUserId as any }, // better-auth standard is string ID
        { $set: { status: "suspended", updatedAt: new Date() } }
      );
      await logAdminAction(
        admin.adminId,
        admin.adminName,
        "suspend_user",
        "user",
        targetUserId,
        `Suspended user account.`
      );
    } else if (actionType === "ban_user" && targetUserId) {
      await db.collection("user").updateOne(
        { _id: targetUserId as any },
        { $set: { status: "banned", updatedAt: new Date() } }
      );
      await logAdminAction(
        admin.adminId,
        admin.adminName,
        "ban_user",
        "user",
        targetUserId,
        `Banned user account.`
      );
    } else if (actionType === "dismiss") {
      await logAdminAction(
        admin.adminId,
        admin.adminName,
        "dismiss_report",
        "report",
        reportId,
        `Dismissed report.`
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/reports");
    revalidatePath("/admin/users");
    revalidatePath("/explore");
    return { success: true };
  } catch (error: any) {
    console.error("takeReportAction error:", error);
    throw new Error("Failed to complete action on report.");
  }
}

// USERS ACTIONS
export async function getUsers() {
  await verifyAdminRole();

  try {
    const users = await db.collection("user").find({}).toArray();

    // Map counts dynamically for posts & reports
    const formattedUsers = [];
    for (const u of users) {
      const postCount = await db
        .collection("spots")
        .countDocuments({ userId: u._id.toString(), deletedAt: null });

      const reportCount = await db
        .collection("reports")
        .countDocuments({ reporterId: u._id.toString() });

      formattedUsers.push({
        id: u._id.toString(),
        name: u.name || "Anonymous",
        email: u.email,
        image: u.image || null,
        role: u.role || "user",
        status: u.status || "active",
        postCount,
        reportCount,
        createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
      });
    }

    return formattedUsers;
  } catch (error: any) {
    console.error("getUsers error:", error);
    throw new Error("Failed to load users list.");
  }
}

export async function updateUserRole(userId: string, role: string) {
  const admin = await verifyAdminRole();

  try {
    await db.collection("user").updateOne(
      { _id: userId as any },
      { $set: { role, updatedAt: new Date() } }
    );

    await logAdminAction(
      admin.adminId,
      admin.adminName,
      "change_role",
      "user",
      userId,
      `Changed role to: ${role}`
    );

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("updateUserRole error:", error);
    throw new Error("Failed to update user role.");
  }
}

export async function updateUserStatus(userId: string, status: string) {
  const admin = await verifyAdminRole();

  try {
    await db.collection("user").updateOne(
      { _id: userId as any },
      { $set: { status, updatedAt: new Date() } }
    );

    await logAdminAction(
      admin.adminId,
      admin.adminName,
      "change_status",
      "user",
      userId,
      `Changed account status to: ${status}`
    );

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("updateUserStatus error:", error);
    throw new Error("Failed to update user status.");
  }
}

// SPOTS ACTIONS
export async function getAllAdminSpots() {
  await verifyAdminRole();

  try {
    const spots = await db
      .collection("spots")
      .find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .toArray();

    return spots.map((spot) => ({
      id: spot._id.toString(),
      title: spot.title,
      description: spot.description,
      category: spot.category,
      address: spot.address,
      rating: spot.rating || 5.0,
      reviewCount: spot.reviewCount || 0,
      image: spot.images && spot.images.length > 0 ? spot.images[0] : "/spot-factory.png",
      featured: !!spot.featured,
      status: spot.status || "Under Review",
      createdAt: spot.createdAt ? spot.createdAt.toISOString() : new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error("getAllAdminSpots error:", error);
    throw new Error("Failed to load spots catalog.");
  }
}

export async function toggleSpotFeatured(spotId: string, featured: boolean) {
  const admin = await verifyAdminRole();

  try {
    await db.collection("spots").updateOne(
      { _id: new ObjectId(spotId) },
      { $set: { featured, updatedAt: new Date() } }
    );

    await logAdminAction(
      admin.adminId,
      admin.adminName,
      featured ? "feature_spot" : "unfeature_spot",
      "spot",
      spotId,
      featured ? "Marked spot as featured" : "Removed spot from featured list"
    );

    revalidatePath("/admin/spots");
    revalidatePath("/explore");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("toggleSpotFeatured error:", error);
    throw new Error("Failed to toggle featured status.");
  }
}

export async function softDeleteSpot(spotId: string) {
  const admin = await verifyAdminRole();

  try {
    await db.collection("spots").updateOne(
      { _id: new ObjectId(spotId) },
      { $set: { deletedAt: new Date(), updatedAt: new Date() } }
    );

    await logAdminAction(
      admin.adminId,
      admin.adminName,
      "delete_spot_soft",
      "spot",
      spotId,
      `Soft deleted spot`
    );

    revalidatePath("/admin/spots");
    revalidatePath("/explore");
    return { success: true };
  } catch (error: any) {
    console.error("softDeleteSpot error:", error);
    throw new Error("Failed to delete spot.");
  }
}

// SETTINGS ACTIONS
export async function getAdminSettings() {
  await verifyAdminRole();

  try {
    const config = await db.collection("settings").findOne({ type: "global" });
    if (!config) {
      // Default settings
      return {
        categories: ["abandoned building", "ruins", "viewpoint", "hidden gem", "underground"],
        safetyTags: ["trespassing risk", "permission needed", "patrolled area", "unstable structure", "safe access"],
        guidelines: "Please explore responsibly. Do not vandalize or take anything.",
      };
    }
    return {
      categories: config.categories || [],
      safetyTags: config.safetyTags || [],
      guidelines: config.guidelines || "",
    };
  } catch (error: any) {
    console.error("getAdminSettings error:", error);
    throw new Error("Failed to load settings.");
  }
}

export async function updateAdminSettings(categories: string[], safetyTags: string[], guidelines: string) {
  const admin = await verifyAdminRole();

  try {
    await db.collection("settings").updateOne(
      { type: "global" },
      {
        $set: {
          categories,
          safetyTags,
          guidelines,
          updatedAt: new Date(),
          updatedBy: admin.adminId,
        },
      },
      { upsert: true }
    );

    await logAdminAction(
      admin.adminId,
      admin.adminName,
      "update_settings",
      "settings",
      "global",
      `Updated global settings (categories, safety tags, guidelines)`
    );

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    console.error("updateAdminSettings error:", error);
    throw new Error("Failed to save settings.");
  }
}
