const Ticket = require("../model/ticketModel");
const Notification = require("../model/notification"); // Import Notification model

// Display all tickets
const getAllTickets = async (req, res, next) => {
  let tickets;
  try {
    tickets = await Ticket.find();
  } catch (err) {
    console.log(err);
  }
  if (!tickets) {
    return res.status(404).json({ message: "No Tickets Found" });
  }
  return res.status(200).json({ tickets });
};

const getTicketsByUserID = async (req, res, next) => {
  const user_id = req.params.user_id;
  let tickets;
  try {
    tickets = await Ticket.find({ user_id: user_id });
  } catch (err) {
    console.log(err);
  }
  if (!tickets) {
    return res.status(404).json({ message: "No Tickets Found" });
  }
  return res.status(200).json({ tickets });
};

// Insert new ticket
const addTicket = async (req, res, next) => {
  const { user_id, name, gmail, phoneNumber, Categories, message, priority } = req.body;
  let ticket;
  try {
    ticket = new Ticket({
      name,
      user_id,
      gmail,
      phoneNumber,
      Categories,
      message,
      priority,
    });
    await ticket.save();

    // 🔔 Notification for User (Ticket Created)
    await Notification.create({
      user_id: Number(user_id),
      message: `Your ticket has been created successfully. Ticket ID: ${ticket._id}`,
    });

  } catch (err) {
    console.log(err);
  }
  if (!ticket) {
    return res.status(404).json({ message: "Unable to add ticket" });
  }
  return res.status(200).json({ ticket });
};

// Select ticket by ID
const getTicketByID = async (req, res, next) => {
  const id = req.params.id;
  let ticket;
  try {
    ticket = await Ticket.findById(id);
  } catch (err) {
    console.log(err);
  }
  if (!ticket) {
    return res.status(404).json({ message: "Unable to Find Ticket" });
  }
  return res.status(200).json({ ticket });
};

// Update ticket (reply and status update)
const updateTicket = async (req, res, next) => {
  const id = req.params.id;
  const { name, gmail, phoneNumber, Categories, message, status, priority } = req.body;
  let ticket;
  try {
    ticket = await Ticket.findByIdAndUpdate(
      id,
      {
        name: name,
        gmail: gmail,
        phoneNumber: phoneNumber,
        Categories: Categories,
        message: message,
        status: status,
        priority: priority,
      },
      { new: true }
    );

    // 🔔 Notification for User (Ticket Updated)
    await Notification.create({
      user_id: Number(ticket.user_id),
      message: `Your ticket status has been updated to ${status}. Ticket ID: ${ticket._id}`,
    });

  } catch (err) {
    console.log(err);
  }
  if (!ticket) {
    return res.status(404).json({ message: "Unable to Update Ticket" });
  }
  return res.status(200).json({ ticket });
};

// Delete ticket
const deleteTicket = async (req, res, next) => {
  const id = req.params.id;
  let ticket;
  try {
    ticket = await Ticket.findByIdAndDelete(id);

    // 🔔 Notification for User (Ticket Deleted)
    await Notification.create({
      user_id: Number(ticket.user_id),
      message: `Your ticket has been deleted. Ticket ID: ${ticket._id}`,
    });

  } catch (err) {
    console.log(err);
  }
  if (!ticket) {
    return res.status(404).json({ message: "Unable to Delete Ticket" });
  }
  return res.status(200).json({ ticket });
};

exports.getAllTickets = getAllTickets;
exports.getTicketsByUserID = getTicketsByUserID;
exports.addTicket = addTicket;
exports.getTicketByID = getTicketByID;
exports.updateTicket = updateTicket;
exports.deleteTicket = deleteTicket;
