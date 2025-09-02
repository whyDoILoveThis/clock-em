import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Timecard from "@/models/Timecard";

export async function DELETE(request: Request) {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await dbConnect();
    console.log("✅ Connected to MongoDB.");

    // Extract request body
    const { companyId, employeeId, weekStart } = await request.json();
    console.log("📥 Incoming delete request:", {
      companyId,
      employeeId,
      weekStart,
    });

    if (!companyId || !employeeId || !weekStart) {
      console.log("⚠️ Missing required fields");
      return NextResponse.json(
        {
          error: "companyId, employeeId, and weekStart are required ❌",
        },
        { status: 400 }
      );
    }

    // Normalize date to YYYY-MM-DD
   console.log("weekstart:>", new Date(weekStart));
   

    // 🗑️ Delete timecard
    console.log("🔍 Attempting to delete timecard...");
    const deletedTimecard = await Timecard.findOneAndDelete({
      companyId,
      employeeId,
      weekStart,
    });

    if (!deletedTimecard) {
      console.log("⚠️ No matching timecard found for deletion");
      return NextResponse.json(
        { error: "Timecard not found ❌" },
        { status: 404 }
      );
    }

    console.log("✅ Timecard deleted:", {
      _id: deletedTimecard._id,
      companyId: deletedTimecard.companyId,
      employeeId: deletedTimecard.employeeId,
      weekStart: deletedTimecard.weekStart,
    });

    return NextResponse.json({
      message: "Timecard deleted successfully ✅",
      deletedTimecard,
    });
  } catch (error) {
    console.error("❌ An error occurred while deleting timecard:", error);
    return NextResponse.json(
      { error: "Internal Server Error ❌" },
      { status: 500 }
    );
  }
}
