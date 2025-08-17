import { MongoClient } from "mongodb";

const uri = "mongodb://mongo1:27017,mongo2:27017,mongo3:27017/?replicaSet=rs0";
export const client = new MongoClient(uri);

export async function connect() {
  if (!client.topology?.isConnected()) await client.connect();
  const db = client.db("app");
  return { db, client };
}
