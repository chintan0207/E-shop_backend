import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { createDefaultAdmin } from "./utils/createDefaultAdmin.js";

dotenv.config({
  path: "/.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .then(async () => {
    await createDefaultAdmin() //call to create default admin
  })
  .catch((error) => {
    console.log("MongoDB connection Failed", error);
  });
