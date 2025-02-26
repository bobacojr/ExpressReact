import mysql2 from "mysql2";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create MySQL connection
const db = mysql2.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "test"
});

db.connect((error) => {
    if (error) {
        console.log("Error while attempting to connect to database: ", error);
        process.exit(1); // Exit the connection process if an error occurs
    }
    console.log(`Successfully connected to database`);
});

export default db;