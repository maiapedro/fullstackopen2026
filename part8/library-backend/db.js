const mongoose = require("mongoose")

const connectToDatabase = async (uri) => {
  if (!uri) {
    console.error("MONGODB_URI is not defined")
    process.exit(1)
  }

  console.log("connecting to MongoDB")

  try {
    await mongoose.connect(uri)
    console.log("connected to MongoDB")
  } catch (error) {
    console.error("error connecting to MongoDB:", error.message)
    process.exit(1)
  }
}

module.exports = { connectToDatabase }
