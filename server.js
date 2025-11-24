import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// HEALTH CHECK (Render needs this!)
app.get("/", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Initialize Admin SDK
if (!admin.apps.length) {
  if (!process.env.SERVICE_ACCOUNT_JSON) {
    console.error("Missing SERVICE_ACCOUNT_JSON env var");
    process.exit(1);
  }

  const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

app.post("/deleteUser", async (req, res) => {
  try {
    const { uid } = req.body || {};
    if (!uid) {
      return res.status(400).json({ error: "Missing uid" });
    }

    await admin.firestore().doc(`user/${uid}`).delete();
    await admin.auth().deleteUser(uid);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({ error: error.toString() });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Admin backend running on http://localhost:${PORT}`);
});
