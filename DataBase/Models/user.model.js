/**
 * schema to DB to do in data
 * model the format of the data
 * return schema User
 */
import mongoose from "mongoose";
const { Schema, model } = mongoose;
const userSchema = new Schema(
  {
    firstName : {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minLength: 3,
    },
    lastName:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minLength: 3,   
    },
    username :{
        type: String,
        trim: true,
    },
    email: {
      type: String,
      required: true,
      unqiue: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    recoveryEmail:{
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    mobNumber:{
        type: Number,
        required: true,
        trim: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user",
    //   enum: Object.values(systemRolesOFUser), 
    },
    statuUser:{
        type: String,
        default: "offline",
        // enum: Object.values(systemRolesOFUserStatus), 
    },
  },
  { timestamps: true, versionKey: "version_key" }
);
const User = model("User", userSchema);
export default User;

