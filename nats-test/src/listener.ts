import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";
const stan = nats.connect("ticketing", randomBytes(8).toString("hex"), {
  url: "http://localhost:4222",
});

console.clear();

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  stan.on("close", () => {
    console.log("NATS connections closed!");
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

process.on("SIGNINT", () => stan.close());
process.on("SIGTERM", () => stan.close());
