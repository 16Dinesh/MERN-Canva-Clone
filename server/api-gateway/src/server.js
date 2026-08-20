require("dotenv").config();

const express = require("express");
const proxy = require("express-http-proxy");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");

const authMiddleware = require("./middleware/auth-middleware");

const app = express();
const PORT = process.env.PORT || 5000;


const services = {
  DESIGN: process.env.DESIGN,
  UPLOAD: process.env.UPLOAD,
  SUBSCRIPTION: process.env.SUBSCRIPTION,
};


app.use((req, res, next) => {
  console.log("INCOMING REQUEST:", req.method, req.originalUrl);

  res.on("finish", () => {
    console.log(
      "RESPONSE:",
      req.method,
      req.originalUrl,
      res.statusCode
    );
  });

  next();
});



app.use(helmet());
app.use(cors());

app.use(express.json({ limit: "20mb" }));
app.use(
  express.urlencoded({
    limit: "20mb",
    extended: true,
  })
);


async function checkService(name, url) {
  try {
    if (!url) {
      console.log(`❌ ${name}: URL is missing`);
      return false;
    }

    const response = await axios.get(`${url}/health`, {
      timeout: 10000,
    });

    const isWorking = response.data === "working";

    if (isWorking) {
      console.log(`✅ ${name}: working`);
    } else {
      console.log(`⚠️ ${name}: unexpected response:`, response.data);
    }

    return isWorking;
  } catch (error) {
    console.log(
      `❌ ${name}: NOT WORKING`,
      error.response?.status || error.message
    );

    return false;
  }
}


async function checkAllServices() {
  console.log("");
  console.log("====================================");
  console.log("Checking all services...");
  console.log("====================================");

  const results = await Promise.all([
    checkService("DESIGN", services.DESIGN),
    checkService("UPLOAD", services.UPLOAD),
    checkService("SUBSCRIPTION", services.SUBSCRIPTION),
  ]);

  const allWorking = results.every(Boolean);

  console.log("====================================");

  if (allWorking) {
    console.log("🎉 ALL SERVICES ARE WORKING");
  } else {
    console.log("⚠️ NOT ALL SERVICES ARE READY");
  }

  console.log("====================================");
  console.log("");

  return allWorking;
}


async function waitForServices() {
  while (true) {
    const allWorking = await checkAllServices();

    if (allWorking) {
      console.log("🚀 All services are ready!");
      return;
    }

    console.log("⏳ Waiting 5 seconds before checking again...");

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });
  }
}


const proxyOptions = {
  proxyReqPathResolver: (req) => {
    const path = req.originalUrl.replace(/^\/v1/, "/api");

    console.log("PROXYING:", {
      method: req.method,
      from: req.originalUrl,
      to: path,
    });

    return path;
  },

  proxyErrorHandler: (err, res, next) => {
    console.error("PROXY ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Internal server error!",
      error: err.message,
    });
  },
};

app.use(
  "/v1/designs",
  authMiddleware,
  proxy(process.env.DESIGN, {
    ...proxyOptions,
  })
);

app.use(
  "/v1/media/upload",
  authMiddleware,
  proxy(process.env.UPLOAD, {
    proxyReqPathResolver: (req) => {
      const path = req.originalUrl.replace(/^\/v1/, "/api");

      console.log("PROXYING UPLOAD:", {
        method: req.method,
        from: req.originalUrl,
        to: path,
      });

      return path;
    },

    parseReqBody: false,

    proxyErrorHandler: (err, res, next) => {
      console.error("UPLOAD PROXY ERROR:", err);

      res.status(500).json({
        success: false,
        message: "Upload service error!",
        error: err.message,
      });
    },
  })
);


app.use(
  "/v1/media",
  authMiddleware,
  proxy(process.env.UPLOAD, {
    ...proxyOptions,
    parseReqBody: true,
  })
);


app.use(
  "/v1/subscription",
  authMiddleware,
  proxy(process.env.SUBSCRIPTION, {
    ...proxyOptions,
  })
);



app.get("/health", async (req, res) => {
  const results = await Promise.all([
    checkService("DESIGN", services.DESIGN),
    checkService("UPLOAD", services.UPLOAD),
    checkService("SUBSCRIPTION", services.SUBSCRIPTION),
  ]);

  const allWorking = results.every(Boolean);

  res.status(allWorking ? 200 : 503).json({
    success: allWorking,
    message: allWorking
      ? "All services are working"
      : "Services are getting ready",
    services: {
      DESIGN: results[0] ? "working" : "not working",
      UPLOAD: results[1] ? "working" : "not working",
      SUBSCRIPTION: results[2] ? "working" : "not working",
    },
  });
});

async function startGateway() {
  try {
    console.log("");
    console.log("====================================");
    console.log("🚀 Starting API Gateway...");
    console.log("====================================");

    console.log(`🎨 DESIGN: ${services.DESIGN}`);
    console.log(`📁 UPLOAD: ${services.UPLOAD}`);
    console.log(`💳 SUBSCRIPTION: ${services.SUBSCRIPTION}`);

    console.log("");

    // Wait until all 3 services return "working"
    await waitForServices();

    // Start gateway only after all services are ready
    app.listen(PORT, () => {
      console.log("");
      console.log("====================================");
      console.log(`🚀 API Gateway running on port ${PORT}`);
      console.log("🎉 ALL SERVICES ARE READY");
      console.log("====================================");
    });
  } catch (error) {
    console.error("❌ Failed to start API Gateway:", error);
    process.exit(1);
  }
}

startGateway();
