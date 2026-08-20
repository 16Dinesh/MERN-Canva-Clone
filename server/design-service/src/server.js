require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const designRoutes = require("./routes/design-routes");

const app = express();
const PORT = process.env.PORT || 5001;

//testing
app.use((req, res, next) => {
  console.log("DESIGN SERVICE REQUEST:", req.method, req.originalUrl);

  res.on("finish", () => {
    console.log(
      "DESIGN SERVICE RESPONSE:",
      req.method,
      req.originalUrl,
      res.statusCode
    );
  });

  next();
})

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB Error", error));

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/designs", designRoutes);

app.get("/health", (req, res) => {
  res.status(200).send("working");
});



async function startServer() {
  try {
    app.get("/health", (req, res) => {
      res.status(200).send("working");
    });

    app.listen(PORT, () =>
      console.log(`DESIGN Service running on port ${PORT}`)
    );
  } catch (error) {
    console.error("Failed to connected to server", error);
    process.exit(1);
  }
}

startServer();
