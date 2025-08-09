import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoDb";
import Message from "@/models/Message";

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
