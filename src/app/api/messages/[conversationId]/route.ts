import { NextResponse as NextResponseMessagesId } from "next/server";
import dbConnectMessagesId from "@/lib/mongoDb";
import MessageMessagesId from "@/models/Message";

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  const { conversationId } = params;
  await dbConnectMessagesId();

  try {
    const messages = await MessageMessagesId.find({ conversationId }).sort({
      timestamp: 1,
    });
    const contact = await MessageMessagesId.findOne({ conversationId });

    return NextResponseMessagesId.json({
      success: true,
      messages,
      contactInfo: {
        name: contact?.profileName,
        number: contact?.conversationId,
      },
    });
  } catch (error) {
    // FIX: Replaced 'any' with 'unknown' and added type checking
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponseMessagesId.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
