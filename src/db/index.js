import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dns from "dns"

dns.setServers(["1.1.1.1", "8.8.8.8"])

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nMOngoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    } catch (err) {
        console.log("MONGODB connection Error", err)
        process.exit(1)
    }
}

export default connectDB