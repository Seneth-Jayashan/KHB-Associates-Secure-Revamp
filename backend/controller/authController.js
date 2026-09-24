const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
);

// Initiate Google OAuth flow
exports.googleAuth = (req, res) => {
    const authorizeUrl = client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ],
        prompt: "consent"
    });
    res.redirect(authorizeUrl);
};

// Google OAuth callback
exports.googleAuthCallback = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("Authorization code not provided");
    }

    try {
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        // Verify the ID token to get user info
        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        
        const payload = ticket.getPayload();
        const { email, given_name, family_name, picture } = payload;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create a new user if they don't exist
            // Using a random placeholder password since they use Google to login
            const randomPassword = Math.random().toString(36).slice(-10);
            
            user = await User.create({
                firstName: given_name || "Google",
                lastName: family_name || "User",
                email: email,
                password: randomPassword,
                profilePic: picture,
                isVerified: true
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );

        // Redirect back to frontend with the token
        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);

    } catch (error) {
        console.error("Error during Google authentication:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
};
