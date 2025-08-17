import { ObjectId } from "mongodb";
export function makeWal(db) {
  const wal = db.collection("app_wal");
  const orders = db.collection("orders");
  return {
    async createOrder(session, payload) {
      const txId = new ObjectId();
      await wal.insertOne(
        {
          _id: txId,
          ts: new Date(),
          type: "createOrder",
          args: payload,
          state: "prepared",
        },
        { writeConcern: { w: "majority" } }
      );

      await session.withTransaction(async () => {
        await orders.insertOne(
          { ...payload, createdAt: new Date() },
          { session }
        );
      });

      await wal.updateOne({ _id: txId }, { $set: { state: "committed" } });
      return { txId };
    },
  };
}
