const nodemailer = require('nodemailer');
const User = require('../model/user');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendVerificationEmail = async (email, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify/${token}`;
    const mailOptions = {
        from:  `"KHB Associates" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your KHB account',
        html: `<h3>Click the link below to verify your email:</h3>
           <a href=${verificationLink}>${verificationLink}</a>`,
    }
    return transporter.sendMail(mailOptions);
};

exports.sendAccountCredentitals = async (firstName,lastName,email,address,phone,password) => {
    const mailOptions = {
        from:  `"KHB Associates" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your KHB Account Informations",
        html:`<h1>Welcome to KHB Associations</h1><br><h3>Account Informations</h3>
            <br><p><b>Name: </b> ${firstName} ${lastName}</p>
            <p><b>Email: </b> ${email}</p>
            <p><b>Address: </b> ${address}</p>
            <p><b>Phone Number: </b> ${phone}</p>
            <p><b>Password: </b> ${password}</p>
            <br><p style="color:#540000">Please change your default password and Profile Picture</p>
            <p style="color:red">Verificaition link was sent to your email.Please check Inbox or Spam</p>*`,
    }
    return transporter.sendMail(mailOptions);
}

exports.sendLowStockNotify = async (stockName, brandName, categoryName, stock) => {
    try {
      const allManagers = await User.find({role: 'inventory_manager'});
  
      if (!Array.isArray(allManagers) || allManagers.length === 0) {
        console.error("No inventory managers found.");
        return;
      }
  
      const mailPromises = allManagers.map((manager) => {
        if (!manager?.email) return null;
  
        const mailOptions = {
          from: `"KHB Associates" <${process.env.EMAIL_USER}>`,
          to: manager.email,
          subject: `🔔 Low Stock Alert: ${stockName}`,
          html: `
            <h1 style="color:#e74c3c;">⚠️ Low Stock Notification</h1>
            <p><strong>Product Name:</strong> ${stockName}</p>
            <p><strong>Brand Name:</strong> ${brandName}</p>
            <p><strong>Category Name:</strong> ${categoryName}</p>
            <p><strong>Current Stock:</strong> ${stock}</p>
            <br/>
            <p style="color:red;">⚠️ Please restock as soon as possible to avoid sales interruptions.</p>
          `,
        };
  
        return transporter.sendMail(mailOptions);
      });
  
      await Promise.all(mailPromises.filter(Boolean));
      console.log(`Low stock email sent to ${allManagers.length} managers`);
    } catch (error) {
      console.error("Failed to send low stock notifications:", error);
    }
  };

exports.sendDiscountNotification = async (firstName, lastName, email, userLevel, discountPercentage,code) => {
    try {
        const mailOptions = {
            from: `"KHB Associates" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `🎉 Exclusive Discount for ${userLevel} Members!`,
            html: `
                <h1>Congratulations ${firstName} ${lastName}!</h1>
                <p>As a <b>${userLevel}</b> member, you have earned an exclusive discount.</p>
                <p>Your discount rate is: <b>${discountPercentage}%</b></p>
                <p>Discount Promo Code: <b> ${code}</b></p>
                <br/>
                <p>Use this discount before 14 days on your next purchase to enjoy great savings!</p>
                <p>Thank you for being a loyal customer of KHB Associates.</p>
                <p>We appreciate your continued support!</p>
            `,
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Discount email sent to ${email} for ${userLevel} member`);
    } catch (error) {
        console.error("Failed to send discount notification:", error);
    }
};

exports.sendResetPassword = async (email, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset/${token}`;
    const mailOptions = {
        from:  `"KHB Associates" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset password of your KHB account',
        html: `<h3>Click the link below to reset your passwrod:</h3>
           <a href=${resetLink}>${resetLink}</a>`,
    }
    return transporter.sendMail(mailOptions);
};

exports.sendDeliveryToDeliver = async (email) => {
  try{
    const mailOptions = {
      from: `"KHB Associates" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'New Delivery Assigned',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2 style="color: #4CAF50;">🚚 New Delivery Assigned!</h2>
          <p>Dear Deliverer,</p>
          <p>You have been assigned a new delivery. Please check your dashboard for details.</p>
          <p>Thank you for your continued efforts!</p>
          <br>
          <p>Best regards,<br><strong>KHB Associates Team</strong></p>
        </div>
      `,
    };
    console.log(`Delivery notification email sent to ${email}`);
    return transporter.sendMail(mailOptions);
  }catch(error){
    console.error("Failed to send delivery notification:", error);
  }
}
