import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoDb";
import Message from "@/models/Message";

// The second argument is an object containing params.
// This syntax directly destructures `params` from that object, which is the
// standard and most compatible way to type dynamic route handlers.
export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  // Destructure the conversationId directly from params
  const { conversationId } = params;
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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
