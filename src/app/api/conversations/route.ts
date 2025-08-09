import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoDb";
import Message from "@/models/Message";

export async function GET() {
  await dbConnect();
  try {
    const conversations = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$conversationId",
          profileName: { $first: "$profileName" },
          lastMessage: { $first: "$text.body" },
          timestamp: { $first: "$timestamp" },
        },
      },
      { $sort: { timestamp: -1 } },
    ]);
    return NextResponse.json({ success: true, conversations });
  } catch (error) {
    // FIX: Replaced 'any' with 'unknown' and added type checking
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
