import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import chatRouter from "./routes/chat.js";
import historyRouter from "./routes/history.js";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// session bootstrap endpoint - returns a new sessionId
app.post("/api/session", (_req, res) => {
  const sessionId = uuidv4();
  res.json({ sessionId });
});

app.use("/api/chat", chatRouter);
app.use("/api/history", historyRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
