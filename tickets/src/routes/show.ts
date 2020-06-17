import express, { Request, Response } from "express";
import { NotFoundError } from "@mftickets/common";
import { Ticket } from "../models/ticket";

const router = express.Router();

router.get("/api/tickets/:id", async (request: Request, response: Response) => {
  const ticket = await Ticket.findById(request.params.id);
  if (!ticket) {
    throw new NotFoundError();
  } else {
    response.status(200).send(ticket);
  }
});

export { router as showTicketRouter };
