import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import Owner from "@/models/Owner";

export async function GET(request: Request) {
  try {
    console.log("Connecting to MongoDB...");
    await dbConnect();
    console.log("Connected to MongoDB.");

    const url = new URL(request.url);
    const searchTerm = url.searchParams.get("searchTerm");
    console.log(`Received search term: ${searchTerm}`);

    if (!searchTerm) {
      return NextResponse.json(
        { error: "Search term is required ❌" },
        { status: 400 }
      );
    }

    // Search for companies whose name contains the search term
    const owners = await Owner.find(
      { "companies.name": { $regex: searchTerm, $options: "i" } },
      { "companies.$": 1 } // only return the matching companies
    );

    const companies = owners.flatMap((owner) => owner.companies);
    console.log(
      `Found ${companies.length} companies matching the search term.`
    );

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("❌ An error occurred:", error);
    return NextResponse.json(
      { error: "Internal Server Error ❌" },
      { status: 500 }
    );
  }
}
