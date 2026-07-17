import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGO_DB_URI!;
const dbName = process.env.AUTH_BD_NAME || "urbex";

let client: MongoClient;
let db: Db;

if (process.env.NODE_ENV === "production") {
  client = new MongoClient(uri);
  db = client.db(dbName);
} else {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
    _mongoDb?: Db;
  };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri);
    globalWithMongo._mongoDb = globalWithMongo._mongoClient.db(dbName);
  }
  client = globalWithMongo._mongoClient!;
  db = globalWithMongo._mongoDb!;
}

export { client, db };
