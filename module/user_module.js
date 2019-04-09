const express = require("express");
const app = express();
var morgan = require("morgan");
var cors=require("cors")
const mysql = require("mysql");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var multer = require("multer");

let date = require("date-and-time");

var moment = require("moment");
moment().format();

const user_module = express.Router();
//user_module.use(cors())

var crypto = require("crypto");
var md5 = require("md5");

var server_connection = require("../server_connection/connection");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  // filename: function (req, file, cb) {

  //   cb(null, file.fieldname + '-' + Date.now()+'.jpg')

  // }

  filename: function(request, file, cb) {
    let fileName = "",
      postName;
    if (typeof request.body.postName !== "undefined") {
      postName = request.body.postName.toLowerCase().replace(/ /g, "-");
      filename += postName;
    }
    fileName += new Date().getTime();
    fileName += ".png";
    cb(null, fileName);
  }
});

var upload = multer({ storage: storage }).single("profileImage");
//var upload = multer({ dest: 'uploads/'});
user_module.post("/image_upload", function(req, res) {
  const con = mysql.createConnection({
    host: server_connection.hostname,
    user: server_connection.user,
    database: server_connection.database_name
  });

  con.connect(function(err) {
    if (err) {
      var json = JSON.stringify({
        status: "200",
        result: server_connection.database_connection_error
      });
      res.end(json);
    } else {
      upload(req, res, function(err, result) {
        if (err) {
          console.log(err)
          res.json({
            status:true,
            message:"upload failed"
          })
          // An unknown error occurred when uploading.
        } else {
          var originalFileName = req.file.filename;
          console.log("file--"+originalFileName)

          var product_id = req.body.product_id;
          var queryString =
            "INSERT product_image (product_image_name,product_id) VALUES(?,?)";
          con.query(queryString, [originalFileName, product_id], function(
            error,
            result
          ) {
            if (error) {
              console.log(errror)
              res.json({
                status: false,
                message: "Image Upload failed"
              });
            } else {
              res.json({
                status: true,
                message: "Image Upload"
              });
            }
          });

          res.json({
            success: true,
            message: "Image Upload"
          });
        }

        // Everything went fine.
      });
    }
  });
});

user_module.post("/registration" , (req, res) => {

  var current_date = new Date().valueOf().toString();
  var random = Math.random().toString();
  var token = crypto
    .createHash("sha1")
    .update(current_date + random)
    .digest("hex");

  var user_name = req.body.user_name;
  var user_email = req.body.user_email;
  var user_phone = req.body.user_phone;
  console.log("naem--"+user_name)
  var user_password = md5(req.body.user_password);
  //var user_password = req.body.user_password;

  const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "test_project"
  });

  con.connect(function(err) {
    if (err) {
      var json = JSON.stringify({
        status: "200",
        result: server_connection.database_connection_error
      });
      res.end(json);
    } else {
      const queryString =
        "INSERT INTO user (user_name,user_email,user_phone,user_password,token) VALUES (?,?,?,?,?)";

      con.query(
        queryString,
        [user_name, user_email, user_phone, user_password, token],
        function(err, result) {
          
          if (err) {
console.log(err)
            var json = JSON.stringify({
              status: "200",
              result: "Some Problem Here"
            });
            res.header("Access-Control-Allow-Origin", "*");
             res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
            res.end(json);
          }
         else{
           console.log("data insert")
            var json = JSON.stringify({
              status: "200",
              token: token
            });
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
            res.end(json);
            console.log(json)
          }
        }
      );
    }
  });
});

user_module.post("/user_login" , (req, res) => {
  const con = mysql.createConnection({
    host: server_connection.hostname,
    user: server_connection.user,
    database: server_connection.database_name
  });

  con.connect(function(err) {
    if (err) {
      var json = JSON.stringify({
        status: "200",
        result: server_connection.database_connection_error
      });
      res.header("Access-Control-Allow-Origin", "*");
             res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
      res.end(json);
    } else {
      var user_email = req.body.user_email;
      var password = md5(req.body.user_password);
      if (user_email && password) {
       
    
       con.query(
          "SELECT * FROM user WHERE user.user_email=? AND user_password=?",
          [user_email, password],
          function(error, results, fields) {
            if (results.length > 0) {
              //   console.log("results  "+qu[0].id)
              //  const con1=mysql.createConnection({
              // host:"localhost",
              // user:"root",
              // database:"test_project"

              //})

              var current_date = new Date().valueOf().toString();
              var random = Math.random().toString();
              var token1 = crypto
                .createHash("sha1")
                .update(current_date + random)
                .digest("hex");
              console.log("update_token--" + token1);
              var row_id = JSON.stringify(results[0].id);

              const updateQueryString =
                "UPDATE user SET user.token=? WHERE user.id=? ";
              con.query(updateQueryString, [token1, row_id], function(
                error,
                results,
                fields
              ) {
                console.log("--" + error);
                console.log("update_token-2222-" + row_id);
              });

          //    res.send("Data Update Successfully");
               var json=JSON.stringify({
                 status:"true",
                 message:"User Login Successfully",
                 token:token1
               })
               res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
               res.end(json)



            } else {
              //	res.send('Incorrect Username and/or Password!');
              var json = JSON.stringify({
                status: "false",
                results: "Incorrect Username and/or Password!"
              });
              res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
              res.end(json);
            }
            res.end();
          }
        );
      } else {
        var json = JSON.stringify({
          status: "false",
          results: "Please enter Username and Password!"
        });
        res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
        res.end(json);
      }
    }
  });
});

user_module.post("/all_category", (req, res) => {
  const con = mysql.createConnection({
    host: server_connection.hostname,
    user: server_connection.user,
    database: server_connection.database_name
  });

  con.connect(function(err) {
    if (err) {
      var json = JSON.stringify({
        status: "200",
        result: server_connection.database_connection_error
      });
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
      res.end(json);
    } else {
      var token = req.body.token;
      var user_id = req.body.user_id;
      const queryString = "SELECT * FROM user WHERE user.id=? AND user.token=?";

      con.query(queryString, [user_id, token], function(
        error,
        results,
        fields
      ) {
        if (results.length > 0) {
          const queryString = "SELECT * FROM category";

          con.query(queryString, function(error, results, fields) {
            var json = JSON.stringify({
              status: true,
              result: results
            });
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
            res.end(json);
          });
        } else {
          var json = JSON.stringify({
            status: false,
            result: "Unvalid User"
          });
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
          res.end(json);
        }
      });
    }
  });
});

user_module.post("/add_user_coupon", (req, res) => {
  const con = mysql.createConnection({
    host: server_connection.hostname,
    user: server_connection.user,
    database: server_connection.database_name,
    timezone: "utc"
  });

  con.connect(function(err) {
    if (err) {
      var json = JSON.stringify({
        status: "200",
        result: server_connection.database_connection_error
      });
      res.end(json);
    } else {
      let now = new Date();

      var coupon_code = req.body.coupon_code;
      var user_id = req.body.user_id;
      const queryString = "SELECT * FROM coupon WHERE coupon_code=?";

      con.query(queryString, [coupon_code], function(error, results, fields) {
        if (results.length > 0) {
          var current_date = moment(now).format("YYYY-MM-DD");
          console.log(current_date);

          var server_expire_date = results[0].coupon_expire_date;
          expire_date = moment(server_expire_date).format("YYYY-MM-DD");

          if (new Date(expire_date) > new Date(current_date)) {
            var coupon_id = results[0].coupon_id;

            var queryString =
              "SELECT * FROM user_coupon WHERE user_coupon.coupon_id=? AND user_coupon.user_id=?";
            con.query(queryString, [coupon_id, user_id], function(
              error1,
              results1,
              fields1
            ) {
              if (results1.length > 0) {
                //	console.log("results---- "+results1[0] )

                var json = JSON.stringify({
                  status: "200",
                  anArray: "Coupon Already addded"
                });
                res.send(json);
              } else {
                var queryString =
                  "INSERT INTO user_coupon (user_id,coupon_id) VALUES(?,?) ";
                con.query(queryString, [user_id, coupon_id], function(
                  error2,
                  results2,
                  fields2
                ) {
                  //	console.log("final result "+results1)
                  //console.log("results2 " )

                  var json = JSON.stringify({
                    status: "200",
                    anArray: "Coupon Added Successfully"
                  });
                  res.send(json);
                });
              }
            });
          } else {
            var json = JSON.stringify({
              status: "200",
              result: "Coupon Date Expire"
            });
            res.end(json);
          }
        } else {
          var json = JSON.stringify({
            status: "200",
            result: "Coupon unvalid"
          });
          res.end(json);
        }
      });
    }
  });
});

function getServerConnection() {
  const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "user_node"
  });
  return con;
}

module.exports = user_module;
