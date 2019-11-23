//Dependencies
let express = require("express");
let logger = require("morgan");
let mongoose = require("mongoose");
const newLocal = require("path");
let path = newLocal;

require("dotenv").config();

//Initializing the port
let PORT = process.env.PORT || 3000;

//Connection to Mongo DB
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });

//mongolab-spherical-02459 as MONGOLAB_MAUVE_URI

// Initialize Express
let app = express();

// Middleware
//Morgan logger
app.use(logger("dev"));

//Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Make public folder static
app.use(express.static("public"));

//Using Handlebars
let exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({
  defaultLayout: "main",
  partialsDir: path.join(__dirname, "/views/partials")
}));
app.set("view engine", "handlebars");

//routes
require("./controller/controller.js")(app);

// Start our server so that it can begin listening to client requests.
app.listen(PORT, function () {

  // Log (server-side) when our server has started
  console.log("Server listening on: http://localhost:" + PORT);
});

module.exports = app;
