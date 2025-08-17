import express from "express";
import { ObjectId } from "mongodb";

export function ordersRouter(db, client, wal) {
  const r = express.Router();
  const orders = db.collection("orders");

  function buildUpdateDoc(body = {}) {
    const allowed = ["status", "amount", "note"];
    const $set = {};
    for (const k of allowed) if (body[k] !== undefined) $set[k] = body[k];
    return Object.keys($set).length ? { $set } : null;
  }

  r.post("/nowal", async (req, res) => {
    try {
      const payload = req.body || {};
      const result = await orders.insertOne({
        ...payload,
        createdAt: new Date(),
      });
      res.status(201).json({ ok: true, id: result.insertedId });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  r.post("/", async (req, res) => {
    const session = client.startSession();
    try {
      const payload = req.body || {};
      const { txId } = await wal.createOrder(session, payload);
      res.status(201).json({ ok: true, txId });
    } catch (e) {
      console.error("POST /orders error:", e);
      res.status(500).json({ ok: false, error: e.message });
    } finally {
      await session.endSession();
    }
  });

  r.put("/:id", async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ ok: false, error: "Invalid id" });

    const update = buildUpdateDoc(req.body);
    if (!update)
      return res.status(400).json({ ok: false, error: "No updatable fields" });

    try {
      const result = await orders.updateOne({ _id: new ObjectId(id) }, update);
      if (!result.matchedCount)
        return res.status(404).json({ ok: false, error: "Not found" });
      res.json({
        ok: true,
        matched: result.matchedCount,
        modified: result.modifiedCount,
      });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  r.patch("/:id", async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ ok: false, error: "Invalid id" });

    const update = buildUpdateDoc(req.body);
    if (!update)
      return res.status(400).json({ ok: false, error: "No updatable fields" });

    try {
      const result = await orders.updateOne({ _id: new ObjectId(id) }, update);
      if (!result.matchedCount)
        return res.status(404).json({ ok: false, error: "Not found" });
      res.json({
        ok: true,
        matched: result.matchedCount,
        modified: result.modifiedCount,
      });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  r.delete("/:id", async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ ok: false, error: "Invalid id" });

    try {
      const result = await orders.deleteOne({ _id: new ObjectId(id) });
      if (!result.deletedCount)
        return res.status(404).json({ ok: false, error: "Not found" });
      res.json({ ok: true, deleted: result.deletedCount });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  r.get("/:id", async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ ok: false, error: "Invalid id" });

    try {
      const doc = await orders.findOne({ _id: new ObjectId(id) });
      if (!doc) return res.status(404).json({ ok: false, error: "Not found" });
      res.json({ ok: true, doc });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  });

  return r;
}
