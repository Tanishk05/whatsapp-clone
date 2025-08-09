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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
