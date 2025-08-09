import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMessage extends Document {
  id: string;
  meta_msg_id?: string;
  from: string;
  to: string;
  timestamp: Date;
  text: {
    body: string;
  };
  type: string;
  status: "sent" | "delivered" | "read";
  conversationId: string;
  profileName: string;
}

const MessageSchema: Schema<IMessage> = new Schema({
  id: { type: String, unique: true, required: true },
  meta_msg_id: String,
  from: { type: String, required: true },
  to: { type: String, required: true },
  timestamp: { type: Date, required: true },
  text: {
    body: String,
  },
  type: { type: String, required: true },
  status: { type: String, default: "sent" },
  conversationId: { type: String, required: true },
  profileName: { type: String, required: true },
});

const Message: Model<IMessage> =
  mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema, "processed_messages");

export default Message;
