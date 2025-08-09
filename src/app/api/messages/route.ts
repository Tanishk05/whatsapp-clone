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
      to: body.conversationId, // Set the 'to' field for the recipient
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
  } catch (error: unknown) {
    // Replaced 'any' with 'unknown' for type safety
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("POST /api/messages error:", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
