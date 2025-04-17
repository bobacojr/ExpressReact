import mysql2 from "mysql2";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create MySQL connection
const db = mysql2.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "test",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    multipleStatements: true // optional, depends on your SQL queries
});

db.connect((error) => {
    if (error) {
        console.log("Error while attempting to connect to database: ", error);
        process.exit(1); // Exit the connection process if an error occurs
    }
    console.log(`Successfully connected to database`);
});

export default db;