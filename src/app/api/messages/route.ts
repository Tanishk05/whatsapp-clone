import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoDb";
import Message from "@/models/Message";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();

    // Basic validation to ensure required fields are present
    if (!body.conversationId || !body.text) {
      return NextResponse.json(
        { success: false, error: "Missing required message fields" },
        { status: 400 }
      );
    }

    const newMessageData = {
      id: `local-${uuidv4()}`,
      from: "me", // Messages sent from the UI are from 'me'
      // *** FIX: Explicitly set the 'to' field for the recipient ***
      to: body.conversationId,
      timestamp: new Date(),
      text: body.text,
      type: "text",
      status: "sent",
      conversationId: body.conversationId,
      profileName: body.profileName,
    };

    const savedMessage = await Message.create(newMessageData);
    return NextResponse.json(
      { success: true, message: savedMessage },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
