
import {MongoClient} from 'mongodb';

// const { MongoClient } = require("mongodb");

async function convertFieldsToArrays() {
  const client = new MongoClient("mongodb+srv://bumihouse:zixx13060@cluster0.yahsqkj.mongodb.net/bumihouse?retryWrites=true&w=majority"); // change if needed
  await client.connect();

  const db = client.db("bumihouse"); // replace with your DB name
  const collection = db.collection("Residency"); // replace with your collection

  const fieldsToConvert = ["image"];

  const cursor = collection.find({});

  for await (const doc of cursor) {
    const updates = {};

    fieldsToConvert.forEach((field) => {
      const value = doc[field];
      if (typeof value === "string") {
        // Handle comma-separated strings OR single strings
        updates[field] = value.includes(",")
          ? value.split(",").map((s) => s.trim())
          : [value.trim()];
      }
    });

    if (Object.keys(updates).length > 0) {
      await collection.updateOne({ _id: doc._id }, { $set: updates });
    }
  }

  console.log("✅ All fields converted.");
  await client.close();
}

convertFieldsToArrays().catch(console.error);
