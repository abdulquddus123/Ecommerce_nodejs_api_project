const express = require("express");
const app = express();
var morgan = require("morgan");
const mysql = require("mysql");

var http=require('http')
const path = require('path');

app.use(express.static(path.join(__dirname, '')));

app.get('/index.html', function (req, res) {
    res.sendFile(path.join(__dirname, 'front_end/index.html'));
});

app.get('/registration.html', function (req, res) {
  res.sendFile(path.join(__dirname, 'front_end/registration.html'));
});


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const user_module = require("./module/user_module");
app.use("/", user_module);

const image_module = require("./module/user_image_module");
app.use("/image_module", image_module);

app.post("/test", (req, res) => {
  console.log("test");

  res.send("Data Save Successfully");
});

app.listen(3000, () => {
  console.log("Server is up and listering on 3000");
});
