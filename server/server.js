require("./config/config");

const path = require("path");
const axios = require("axios");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const handlebars = require("express-handlebars");
const express = require("express");

const app = express();
const port = process.env.PORT;
const publicPath = path.join(__dirname, "..", "public");

app.use(express.static(publicPath));
app.use(cookieParser("Backwird"));
app.use(
  session({
    cookie: { maxAge: 60000 },
    saveUninitialized: true,
    resave: true,
    secret: "WHAT UP!"
  })
);
app.use(flash());

/*** MIDDLEWARE FOR HEROKU REDIRECT (HTTP TO HTTPS) ***/

if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}

app.engine("hbs", handlebars());
app.set("view engine", "hbs");
app.set("views", publicPath);

app.get("/", (req, res) => {
  res.render("index", {
    message: req.flash("confirm")
  });
});

app.post(
  "/subscribe",
  express.json(),
  express.urlencoded({ extended: true }),
  async (req, res) => {
    try {
      const urlInstance = "us14";
      const listID = "61e241df66";
      const url = `https://${urlInstance}.api.mailchimp.com/3.0/lists/${listID}/members/`;
      await axios.post(
        url,
        {
          email_address: req.body.email,
          status: "subscribed"
        },
        {
          auth: {
            username: "garretteklof",
            password: process.env.MAILCHIMP_API_KEY
          }
        }
      );
      req.flash("confirm", "We got ya! 🎉");
      res.redirect("/");
    } catch (e) {
      if (e.response.data.title === "Member Exists") {
        req.flash("confirm", "We already have you on our list, silly goose!");
      } else if (e.response.data.title === "Invalid Resource") {
        req.flash(
          "confirm",
          "Recheck that email and verify its validity, homie!"
        );
      } else {
        req.flash(
          "confirm",
          "Uh oh. Something went wrong. Please recheck your submission, or try again later."
        );
      }
      res.redirect("/");
    }
  }
);

app.get("*", (req, res) => {
  res.redirect("/");
});

app.listen(port, () => {
  if (app.get("env") === "development") {
    console.log(`Server started, and listening on port ${port}!`);
  }
});
