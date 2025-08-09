import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoDb";
import Message from "@/models/Message";

export async function POST(req: Request) {
  await dbConnect();
  const payload = await req.json();

  const webhookData = payload.metaData;

  if (!webhookData || !webhookData.entry) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid payload structure: missing metaData or entry",
      },
      { status: 400 }
    );
  }

  try {
    const change = webhookData.entry[0]?.changes[0]?.value;

    // Logic for new message payload
    if (change?.messages) {
      const messageData = change.messages[0];
      const contact = change.contacts[0];

      const messagePayload = {
        from: messageData.from,
        to: change.metadata.display_phone_number,
        timestamp: new Date(parseInt(messageData.timestamp) * 1000),
        text: messageData.text,
        type: messageData.type,
        conversationId: contact.wa_id,
        profileName: contact.profile.name,
      };

      // Use findOneAndUpdate with upsert to avoid duplicate key errors
      await Message.findOneAndUpdate(
        { id: messageData.id },
        { $set: messagePayload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return NextResponse.json({ success: true, message: "Message processed" });
    }

    // Logic for status update payload
    if (change?.statuses) {
      const statusData = change.statuses[0];
      await Message.updateOne(
        { id: statusData.id },
        { $set: { status: statusData.status } }
      );
      return NextResponse.json({ success: true, message: "Status updated" });
    }

    return NextResponse.json(
      { success: false, message: "Payload is not a message or status update" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    // Check for duplicate key error specifically
    if (error.code === 11000) {
      return NextResponse.json({
        success: true,
        message: "Duplicate message ignored.",
      });
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
