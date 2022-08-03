import express from "express";
import dotenv from "dotenv";
import path from "path";

import bodyParser from "body-parser";
import cors from "cors";
import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";

import publicRoutes from "./src/routes/public";
import apiRoutes from "./src/routes/api";
import adminRoutes from "./src/routes/admin";
import apiMiddleware from "./src/middleware/apiAuth";
import adminMiddleware from "./src/middleware/adminAuth";
import errorHandler from "./src/middleware/errorHandler";

dotenv.config();

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.set("view engine", "ejs");
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/pub", publicRoutes);
app.use("/api", apiMiddleware, apiRoutes);
app.use("/api/admin", apiMiddleware, adminMiddleware, adminRoutes);

app.get("*", (req, res, _next) => {
  const canvas = createCanvas();
  JsBarcode(canvas, req.query.keyword || "Hello", {
    marginBottom: 30,
    height: 8 * 30,
    width: 5,
  });
  const str = canvas.toDataURL();
  res.render(path.join(__dirname, "public", "index.ejs"), {
    canvas: str,
    keyword: req.query.keyword ? `${req.query.keyword.slice(0, 6)}...` : "",
    inputVal: req.query.keyword || "",
  });
});

app.use(errorHandler);

module.exports = app;
