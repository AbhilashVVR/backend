const express = require("express");
const path = require("path");
const passport = require("passport");
const googleStrategy = require("passport-google-oauth20").Strategy;
const facebookStrategy = require("passport-facebook").Strategy;
const cookieParser = require("cookie-parser");
const ejs = require("ejs");
const http = require("http");
const socketio = require("socket.io");

require("dotenv").config();

// console.log(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.FACEBOOK_CLIENT_ID, process.env.FACEBOOK_CLIENT_SECRET, process.env.SESSION_SECRET);

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET,
  SESSION_SECRET,
} = process.env;

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const cors = require("cors");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// middleware

app.use("/asset_imgs", express.static(__dirname + "/uploads"));

app.use(express.json());
//app.use(bodyparser.urlencoded({extended: true}));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    // "preflightContinue": false,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());

// Passport setup for google authentication
passport.use(
  new googleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log("Access Token", accessToken);
      console.log("Referesh Token", refreshToken);
      console.log("profile", profile);
      console.log("C-B", cb);
      return cb(null, profile);
    }
  )
);

passport.use(
  new facebookStrategy(
    {
      clientID: FACEBOOK_CLIENT_ID,
      clientSecret: FACEBOOK_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log("Access Token", accessToken);
      console.log("Referesh Token", refreshToken);
      console.log("profile", profile);
      console.log("C-B", cb);
      return cb(null, profile);
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

app.use(
  require("express-session")({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
); // secret key for sessions
app.use(passport.initialize());
app.use(passport.session());

//Import Routes
const adminRoute = require("./routes/admin");
const userRoute = require("./routes/user");
const gameRoute = require("./routes/game");
const singlequeRoute = require("./routes/singlePlayerQuestions");
const websiteGameQueRoute = require("./routes/websiteGameQuestions");
const dailycompRoute = require("./routes/dailyCompetition");
const powerRoute = require("./routes/powerUp");
//const walletRoute = require('./routes/wallet');
const passwordReset = require("./routes/passwordReset");
const categoryRoute = require("./routes/category");
const coinRoute = require("./routes/coin");
const friendRequestRoute = require("./routes/friendRequest");
const squadRoute = require("./routes/squad");
//const groupRoute = require('./routes/group');
const purchaseRoute = require("./routes/purchase");
const rewardsRoute = require("./routes/rewards");
const leaderboardRoute = require("./routes/leaderboard");
const answerRoute = require("./routes/answer");
const transactionRoute = require("./routes/transaction");
const transactionIdRoute = require("./routes/transactionId");
const excerciseRoute = require("./routes/excercise");
const bannerRoute = require("./routes/banner");
const queryRoute = require("./routes/query");
const orderRoute = require("./routes/order");
const notificationRoute = require("./routes/notification");
const analyticsRoute = require("./routes/analytics");
// const oauthRoute = require('./routes/oauth');
// app.use('/api/oauth', oauthRoute);
app.use("/api/admin", adminRoute);
app.use("/api/banner", bannerRoute);
app.use("/api/user", userRoute);
app.use("/api/game", gameRoute);
app.use("/api/singleque", singlequeRoute);
app.use("/api/websiteGameQue", websiteGameQueRoute);
app.use("/api/dailycomp", dailycompRoute);
app.use("/api/power-ups", powerRoute);
//app.use('/api/wallet', walletRoute);
app.use("/api/password-reset", passwordReset);
app.use("/api/category", categoryRoute);
app.use("/api/coin", coinRoute);
app.use("/api/friendRequest", friendRequestRoute);
app.use("/api/squad", squadRoute);
//app.use('/api/group', groupRoute);
app.use("/api/purchase", purchaseRoute);
app.use("/api/rewards", rewardsRoute);
app.use("/api/leaderboard", leaderboardRoute);
app.use("/api/answer", answerRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/transactionId", transactionIdRoute);
app.use("/api/excercise", excerciseRoute);
app.use("/api/query", queryRoute);
app.use("/api/order", orderRoute);
app.use("/api/notification", notificationRoute);
app.use("/api/analytics", analyticsRoute);
//Routes
app.get("/", (req, res) => {
  res.send({ message: "Server is Up", status: 200 });
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["user_friends", "manage_pages"] })
);

// app.get('/auth/google/callback', passport.authenticate('google'));
app.get(
  "/auth/google/callback",
  passport.authenticate(
    "google",
    { failureRedirect: "/auth/google" } // change this end point to login page route
  ),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);
app.get("/auth/facebook/callback", passport.authenticate("facebook"));

app.post("/logout", function (req, res) {
  req.cookies.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

// forgot password
app.get("/forgot-password", (req, res) => res.render("forgot_password"));

// reset password
app.get("/reset-password", (req, res) => res.render("reset_password"));

// socket events
io.on("connection", () => {
  console.log("New Websocket connection");
  socket.emit("connection Found");
});

//Listen
server.listen(process.env.PORT || 3001, () => {
  console.log("Server Started");
});
