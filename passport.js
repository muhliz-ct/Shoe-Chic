const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/userModel");
require('dotenv').config();


passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENTID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3313/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log("Google profile:", profile);
                const { id: googleId, email, displayName: fullName } = profile;

                let user = await User.findOne({ email: profile._json.email });
                if (!user) {
                    console.log("User not found, creating a new one...");
                    user = await User.create({
                        googleId,
                        email: profile._json.email,
                        fullName,
                        password: googleId,
                        phone: '08958093553'
                    });
                    console.log("New user created:", user);
                } else {
                    console.log("User found:", user);
                }

                return done(null, user);
            } catch (error) {
                console.error("Error during Google authentication:", error);
                return done(error, null);
            }
        }
    )
);


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = {
    googleAuth: passport.authenticate("google", { scope: ["profile", "email"] }),

    googleCallback: passport.authenticate("google", {
        failureRedirect: "/login",
      
    }),

    setupSession: (req, res, next) => {
        if (req.isAuthenticated()) {
            console.log("User authenticated:", req.user);
            req.session.user = req.user;
        } else {
            console.log("User not authenticated");
        }
        console.log("Session user:", req.session.user);
        res.redirect("/");
    },
    
};