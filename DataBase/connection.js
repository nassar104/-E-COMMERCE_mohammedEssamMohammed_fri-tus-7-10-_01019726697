//function Connect database mongodb in mongodb://localhost:27017/exmapp from .env

import mongoose from "mongoose";

export const connection_db = async () => {
  try {

    await mongoose.connect(process.env.CONNECTION_DB_URI);

    console.log("Database mongodb connected in local!");
  } catch (error) {
  
    console.log("Error connecting to database", error);
  }
};
export default connection_db;
