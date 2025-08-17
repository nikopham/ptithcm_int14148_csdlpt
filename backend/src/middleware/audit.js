export function audit(db) {
  const coll = db.collection("audit_logs");
  return (req, res, next) => {
    const start = Date.now();
    res.on("finish", async () => {
      try {
        await coll.insertOne({
          ts: new Date(),
          actor: { userId: req.headers["x-user-id"] || "anon", role: "guest" },
          action: `${req.method} ${req.path}`,
          status: res.statusCode,
          rt_ms: Date.now() - start,
          ip: req.ip,
          ua: req.headers["user-agent"],
        });
      } catch (e) {

      }
    });
    next();
  };
}
