import express from "express";
import morgan from "morgan";
import { connect } from "./db.js";
import { audit } from "./middleware/audit.js";
import { makeWal } from "./logging/wal.js";
import { ordersRouter } from "./routes/orders.js";

const { db, client } = await connect();
const wal = makeWal(db);

const app = express();
app.use(express.json());  
app.use(morgan("dev"));
if (process.env.AUDIT !== "0") app.use(audit(db));
app.use("/orders", ordersRouter(db, client, wal));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on http://localhost:${port}`));
