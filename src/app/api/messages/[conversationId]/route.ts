import { NextResponse, type NextRequest } from "next/server";
import dbConnect from "@/lib/mongoDb";
import Message from "@/models/Message";

export async function GET(req: NextRequest, context: unknown) {
  // Assert params type locally instead of in the signature
  const { conversationId } = (context as { params: { conversationId: string } })
    .params;

  await dbConnect();

  try {
    const messages = await Message.find({ conversationId }).sort({
      timestamp: 1,
    });

    const contact = await Message.findOne({ conversationId });

    return NextResponse.json({
      success: true,
      messages,
      contactInfo: {
        name: contact?.profileName,
        number: contact?.conversationId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
