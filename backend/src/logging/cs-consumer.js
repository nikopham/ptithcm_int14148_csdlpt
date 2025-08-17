import { connect } from "../db.js";

const { db } = await connect();
const orders = db.collection("orders");
const sink = db.collection("log_entries");

const pipeline = [
  {
    $match: {
      operationType: { $in: ["insert", "update", "replace", "delete"] },
    },
  },
];
const cs = orders.watch(pipeline, { fullDocument: "updateLookup" });

console.log("Change Streams consumer started...");
for await (const ev of cs) {
  await sink.insertOne(
    {
      ts: new Date(),
      meta: { source: "orders" },
      op: ev.operationType,
      ns: `${ev.ns.db}.${ev.ns.coll}`,
      key: ev.documentKey,
      full: ev.fullDocument ?? null,
      resumeToken: ev._id,
    },
    { writeConcern: { w: "majority" } }
  );
}
