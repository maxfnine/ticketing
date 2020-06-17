import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";

it("fetches the order", async () => {
  //create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await ticket.save();

  const userCookie = global.signin();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userCookie)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", userCookie)
    .send()
    .expect(200);

  expect(order.id).toEqual(fetchedOrder.id);
});

it("returns an error if one user tries to fetch another users order", async () => {
  //create a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await ticket.save();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(401);
});

it("returns an error if user tries to fetch not existing order", async () => {
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${mongoose.Types.ObjectId().toHexString()}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});
