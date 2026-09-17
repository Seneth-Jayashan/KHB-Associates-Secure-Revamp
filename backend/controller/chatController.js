const Chat = require("../model/chatModel");
const Ticket = require("../model/ticketModel"); // Import Ticket model
const Notification = require("../model/notification"); // Import Notification model

// Get all chat messages for a ticket
const getChatsByTicketId = async (req, res) => {
  try {
    const chats = await Chat.find({ ticketId: req.params.ticketId }).sort(
      "timestamp"
    );
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new chat message
const addChatMessage = async (req, res) => {
  const { ticketId, sender, message } = req.body;

  try {
    // Fetch the ticket to get the user_id
    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    const newChat = new Chat({ ticketId, sender, message });
    const savedChat = await newChat.save();

    // 🔔 Notification for New Chat Message
    if (sender === "admin") {
      // If the sender is the support team, notify the user
      await Notification.create({
        user_id: ticket.user_id, // Use the user's user_id
        message: `A new message has been added to ticket by the support team: "${message}"`,
      });
    }
    res.status(201).json(savedChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getChatsByTicketId,
  addChatMessage,
};