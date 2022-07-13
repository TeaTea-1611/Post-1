import { getModelForClass, prop } from "@typegoose/typegoose";
import mongoose from "mongoose";

export class Tokens {
  _id!: mongoose.Types.ObjectId;

  @prop({ required: true })
  uid!: string;

  @prop({ required: true })
  token!: string;

  @prop({ default: Date.now(), expires: 60 * 5 })
  createdAt: Date;
}

export const TokensModel = getModelForClass(Tokens);
