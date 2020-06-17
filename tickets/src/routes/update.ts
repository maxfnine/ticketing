import express, { Request, Response } from "express";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import {
  validateRequest,
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  BadRequestError,
} from "@mftickets/common";
import { natsWrapper } from "../nats-wrapper";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (request: Request, response: Response) => {
    const ticket = await Ticket.findById(request.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError("Cnnot edit a reserved ticket");
    }

    if (ticket.userId !== request.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    ticket.set({
      title: request.body.title,
      price: request.body.price,
    });

    await ticket.save();
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: request.currentUser!.id,
      version: ticket.version,
    });
    response.send(ticket);
  }
);

export { router as updateTicketRouter };
