import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

jest.mock("../nats-wrapper");

process.env.STRIPE_KEY =
  "sk_test_51GujZCHNXPkTLpSxSy5Co639mWLTk8k5q2Nv3ZVkjkHFO0z1EKAhkjG2GWWXWcYao8mNFNhqnqIe2Et6iItqCR8a007IYDNtsK";
let mongo: any;
beforeAll(async () => {
  jest.clearAllMocks();
  process.env.JWT_KEY = "asdfasdf";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  //Build a JWT payload. {id,email}
  const payload = {
    email: "test@test.com",
    id: id || new mongoose.Types.ObjectId().toHexString(),
  };

  //Create JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  //Build session object. {jwt: MY_JWT}
  const session = { jwt: token };

  //Turn session into JSON
  const sessionJSON = JSON.stringify(session);

  //Take JSON an encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  //return a string thats the cookie with encoded data
  return [`express:sess=${base64}`];
};
