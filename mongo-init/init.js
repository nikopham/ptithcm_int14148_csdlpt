rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017", priority: 2 },
    { _id: 1, host: "mongo2:27017", priority: 1 },
    { _id: 2, host: "mongo3:27017", priority: 1 },
  ],
});

function waitPrimary() {
  let s = rs.status();
  while (!s.members || !s.members.find((m) => m.stateStr === "PRIMARY")) {
    sleep(1000);
    s = rs.status();
  }
}
waitPrimary();

db = db.getSiblingDB("app");
db.createCollection("log_entries", {
  timeseries: { timeField: "ts", metaField: "meta", granularity: "seconds" },
  expireAfterSeconds: 30 * 24 * 3600,
});
db.createCollection("audit_logs", {
  timeseries: { timeField: "ts", metaField: "actor", granularity: "seconds" },
  expireAfterSeconds: 30 * 24 * 3600,
});

// WAL là collection thường
db.createCollection("app_wal");
db.createCollection("orders");
db.orders.createIndex({ userId: 1, createdAt: 1 });
print("Replica set + collections are ready.");
