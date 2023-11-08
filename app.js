const express = require("express");
const cors = require("cors");
const db = require("./app/models");
const dotenv = require("dotenv")


const app = express();
dotenv.config()

const Role = db.role;

// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Db');
//   initial();
// });

db.sequelize.sync().then();

function initial() {
  Role.create({
    id: 1,
    name: "user"
  });
 
  Role.create({
    id: 2,
    name: "moderator"
  });
 
  Role.create({
    id: 3,
    name: "admin"
  });
}

var corsOptions = {
  origin: process.env.WHITELISTED_ORIGIN?.split(',') || "http://localhost:8081"
};

console.log(process.env.WHITELISTED_ORIGIN?.split(','))

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/health", (req, res) => {
  res.json({ message: "Health check ok." });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/trends.routes')(app);
require('./app/routes/topic_scrape_request.routes')(app);
require('./app/routes/tweet.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});