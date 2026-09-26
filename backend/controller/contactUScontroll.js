const contact = require("../model/contactModel");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sajanaanupama123@gmail.com", // Replace with your email
    pass: "melc veit raso vsqm", // Replace with your app password
  },
});

//data Display
const getAllMs = async (req, res, next) => {
  let Ms;

  //get all messages
  try {
    Ms = await contact.find();
  } catch (err) {
    console.log(err);
  }
  //not found
  if (!Ms) {
    return res.status(404).json({ message: "No Messages Found" });
  }
  //display Ms
  return res.status(200).json({ Ms });
};

//data Insert
const addMs = async (req, res, next) => {
  const { name, gmail, phoneNumber, message } = req.body;

  let Ms;
  //add all ms
  try {
    Ms = new contact({ name, gmail, phoneNumber, message });
    await Ms.save();
     // Send an email to the support admin
    const mailOptions = {
      from: `"${name}" <${gmail}>`, // Customer's name and email
      to: "sajanaanupama123@gmail.com", // Replace with the support admin's email
      replyTo: gmail, // This makes replies go to the user
      subject: "New Contact Us Form Submission",
      text: `You have received a new message from the Contact Us form:\n\n
      Name: ${name}\n
      Email: ${gmail}\n
      Phone Number: ${phoneNumber}\n
      Message: ${message}\n\n
      Please respond to the customer as soon as possible.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email to admin:", error);
      } else {
        console.log("Email sent to admin: " + info.response);
      }
    });
 
  } catch (err) {
    console.log(err);
  }
  //not insert Ms
  if (!Ms) {
    return res.status(404).json({ message: "unable to add message" });
  }
  return res.status(200).json({ Ms });
};

//select
const getByID = async (req, res, next) => {
  const id = req.params.id;

  let Ms;

  try {
    Ms = await contact.findById(id);
  } catch (err) {
    console.log(err);
  }
  //not avalable MS
  if (!Ms) {
    return res.status(404).json({ message: "Unable to Find message" });
  }
  return res.status(200).json({ Ms });
};

//update
const replyUser = async (req, res, next) => {
  const id = req.params.id;
  const { name, gmail, phoneNumber, message, reply } = req.body;

  let Ms;

  try {
    Ms = await contact.findByIdAndUpdate(
      id,
      {
        name: name,
        gmail: gmail,
        phoneNumber: phoneNumber,
        message: message,
        reply: reply,
      },
      { new: true }
    );

    // Send an email to the user with the reply
    const mailOptions = {
      from: "KHB Associates pvt ltd <sajanaanupama123@gmail.com> ",
      to: gmail, // Send email to the user's Gmail
      subject: "Reply to Your Contact Form Submission",
      text: `Dear ${name},\n\nThank you for reaching out. 
      \n\nHere is our response to your message\n "${message}"
      \n\nReply :"${reply}"\n\nBest regards,\nKHB Associates (pvt) ltd`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (err) {
    console.log(err);
  }

  if (!Ms) {
    return res.status(404).json({ message: "Unable to Reply Message" });
  }
  return res.status(200).json({ Ms });
};

//delete
const deletecontactM = async (req, res, next) => {
  const id = req.params.id;

  let Ms;

  try {
    Ms = await contact.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
  }

  if (!Ms) {
    return res
      .status(404)
      .json({ message: "Unable to delete contact Message" });
  }
  return res.status(200).json({ Ms });
};

exports.getAllMs = getAllMs;
exports.addMs = addMs;
exports.getByID = getByID;
exports.replyUser = replyUser;
exports.deletecontactM = deletecontactM;