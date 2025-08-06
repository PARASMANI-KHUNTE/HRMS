const mongoose = require("mongoose");


const connectDB = async () => {
    try {
        const uri = process.env.NODE_ENV === 'development' ? process.env.MONGODB_URI_DEV : process.env.MONGODB_URI_PROD;
        await mongoose.connect(uri);
        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB;
