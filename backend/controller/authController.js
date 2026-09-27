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
        const { sub, email, given_name, family_name, picture } = payload;

        let user = await User.findOne({ googleId: sub });

        if (!user) {
            user = await User.findOne({ email });

            if (user) {

                user.googleId = sub;
                await user.save();
            } else {

                const randomPassword = Math.random().toString(36).slice(-10);

                user = await User.create({
                    firstName: given_name || "Google",
                    lastName: family_name || "User",
                    email: email,
                    password: randomPassword,
                    googleId: sub,
                    profilePic: picture,
                    isVerified: true,
                    role: 'customer'
                });
            }
        }


        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.SECRET_KEY,
            { expiresIn: "30m" }
        );

        res.redirect(`${process.env.FRONTEND_URL}/signin?token=${token}&role=${user.role}&id=${user.user_id}`);

    } catch (error) {
        console.error("Error during Google authentication:", error);
        res.redirect(`${process.env.FRONTEND_URL}/signin?error=auth_failed`);
    }
};
