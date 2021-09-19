import { Document, Model, model, Schema } from "mongoose";

/**
 * Interface to model the User Schema for TypeScript.
 * @param email:string
 * @param password:string
 * @param avatar:string
 */
export interface IUser extends Document {
  email: string;
  password: string;
}

const userSchema: Schema<IUser> = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  gravatar: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User: Model<IUser> = model("User", userSchema);

export default User;
