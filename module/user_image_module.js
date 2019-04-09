const express = require("express");
const app = express();
var morgan = require("morgan");
const mysql = require("mysql");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var multer = require("multer");
const _ = require("lodash");

let date = require("date-and-time");

var moment = require("moment");
moment().format();

const user_image_module = express.Router();

var server_connection=require("../server_connection/connection")

var crypto = require("crypto");
var md5 = require("md5");


//get all product by category
user_image_module.post("/productByCategory",(req,res)=>{
  var category_id=req.body.category_id;
   
  const con = mysql.createConnection({
    host: server_connection.hostname,
        user: server_connection.user,
        database: server_connection.database_name
  });

  con.connect(function(err){
    if(err){
      var json=JSON.stringify({
        status:false,
        result: server_connection.database_connection_error
      });
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
      res.end(json)
    }
    else{
    
      const queryString="SELECT * FROM product WHERE category_id=?"
      con.query(queryString,[category_id],function(error,result){
        console.log(result)
        console.log(error)
       if(result.length>0){
         var json=JSON.stringify({
           status:true,
            data:result
         })
         res.header("Access-Control-Allow-Origin", "*");
         res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
         res.end(json)

       }
       else{
        var json=JSON.stringify({
          status:false,
          message: "No data found"
        });
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
        res.end(json)
       }

      })


    }
  })
})





//get  all product with  images
user_image_module.post("/all_product_with_pic", (req, res) => {
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
    }
    else{
      
  var token = req.body.token;
  var user_id = req.body.user_id;
  const queryString = "SELECT * FROM user WHERE user.id=? AND user.token=?";

  con.query(queryString, [user_id, token], function(error, results, fields) {
    if (results.length > 0) {
      //var queryString="SELECT p.product_id,p.product_name, GROUP_CONCAT(i.product_image_name) AS image FROM product AS p LEFT JOIN product_image AS i ON i.product_id = p.product_id AND i.product_image_name IS NOT NULL GROUP BY p.product_id"
      var queryString =
        "SELECT p.product_id, p.product_name,p.product_price, i1.product_image_name FROM product p LEFT JOIN product_image i1 ON p.product_id = i1.product_id INNER JOIN ( SELECT product_id,product_image_name FROM product_image GROUP BY product_id ) i2 ON i1.product_id = i2.product_id AND i1.product_id = p.product_id";
      con.query(queryString, function(error, results, field) {
        var array = [];
        var array_two = [];

       
        var id_array = [];
        custom_array = results;
        var myObject1 = {};
        for (var i = 0; i < results.length; i++) {
          custom_array = results;

          id_array[i] = results[i].product_id;

          var product = results[i];
          var product_id = product.product_id;

          var product_name = results[i].product_name;
          var product_price=results[i].product_price;
          var custom_product_id = results[i].product_id;
          //image_array=results[i].product_image_name
          var image_array = [];

          for (j = 0; j < results.length; j++) {
            console.log(
              "array_id---" + id_array[i] + "pro--" + results[j].product_id
            );
            if (id_array[i] == results[j].product_id) {
              var product_image = results[j].product_image_name;
              image_array.push(product_image);
            }
          }

          myObject1 = {
            product_id: product_id,
            name: product_name,
            product_price : product_price,
            image: image_array
          };

          array_two.push(myObject1);

          var two_array = _.uniqWith(array_two, _.isEqual);
        }

        var json = JSON.stringify({
          status: "200",
          two_array
        });
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
        res.end(json);
      });
    } else {
      var json = JSON.stringify({
        status: "400",
        message: "unvalid user"
      });
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
      res.end(json);
    }
  });
    }
  })

});

//get api all images filtering category
user_image_module.post("/all_product_with_pic_category_filter", (req, res) => {
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
    }
    else{

      var token = req.body.token;
      var user_id = req.body.user_id;
      var category_id = req.body.category_id;
      
      const queryString = "SELECT * FROM user WHERE user.id=? AND user.token=?";
    
      con.query(queryString, [user_id, token], function(error, results, fields) {
        if (results.length > 0) {
          var queryString = "SELECT product.product_name,product.product_id From product WHERE product.category_id=?";
          con.query(queryString, [category_id], function(error1, results1, fields) {
            if (results1.length > 0) {
              console.log(results1)
              var queryString="SELECT product.product_id,product.product_price, product.product_name,product_image.product_image_name FROM product INNER JOIN product_image WHERE product.product_id = product_image.product_id AND product.category_id=?";
              // var queryString =
              //   "SELECT product.product_id,product.product_price product.product_name,product_image.product_image_name FROM product INNER JOIN product_image WHERE product.product_id = product_image.product_id AND product.category_id=?";
              con.query(queryString,[category_id], function(error, results2, field) {
                console.log("result 2"+results2)
                var array_two = [];
    
              
                var id_array = [];
               
                var myObject1 = {};
                for (var i = 0; i < results2.length; i++) {
                  
    
                  id_array[i] = results2[i].product_id;
    
                  var product = results2[i];
                  var product_id = product.product_id;
    
                  
                  var product_name = results2[i].product_name;
                  var product_price=results2[i].product_price;
                  var custom_product_id = results2[i].product_id;
    
                  var image_array = [];
    
                  for (j = 0; j < results2.length; j++) {
                    
                    if (id_array[i] == results2[j].product_id) {
                      var product_image = results2[j].product_image_name;
                      image_array.push(product_image);
                    }
                  }
    
              
    
                  myObject1 = {
                    product_id: product_id,
                    name: product_name,
                    product_price:product_price,
                    image: image_array
                  };
    
                  array_two.push(myObject1);
    
                  var two_array = _.uniqWith(array_two, _.isEqual);
                }
    
                console.log("array "+two_array)
                var json = JSON.stringify({
                  status: "200",
                  two_array
                });
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
                res.end(json);
              });
            } else {
              var json = JSON.stringify({
                status: "true",
                message: "No Data Found"
              });
              res.header("Access-Control-Allow-Origin", "*");
              res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
              res.end(json);
            }
          });
        } else {
          var json = JSON.stringify({
            status: "400",
            message: "unvalid user"
          });
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
          res.end(json);
        }
      });
    }
  })

});

user_image_module.post("/coupon_validity_check", (req, res) => {
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
    }
    else{
      
  var product_id = req.body.product_id;
  var coupon_code = req.body.coupon_code;
  var token = req.body.token;
  var user_id = req.body.user_id;
  var product_price =req.body.product_price;
  const queryString = "SELECT * FROM user WHERE user.id=? AND user.token=?";

  con.query(queryString, [user_id, token], function(error, results, fields) {
    if (results.length > 0) {
      //const queryString="SELECT * FROM product,coupon WHERE product.product_id=? AND coupon_code=? "
      // const queryString = "SELECT * FROM product WHERE product.product_id=?";
      // con.query(queryString, [product_id], function(error, results1, fields) {
      //   console.log("entry query " + results1.length);

      //   if (results1.length > 0) {
          
           
          let now = new Date();
          var current_date = moment(now).format("YYYY-MM-DD");
         

          const queryString =
            "SELECT * FROM coupon WHERE  coupon.coupon_code=?";
          con.query(queryString, [ coupon_code], function(
            error2,
            results2,
            fields
          ) {
            if (results2.length > 0) {
              console.log("success " + results2);

              console.log("error " + error2);
              for (var i = 0; i < results2.length; i++) {
                var server_expire_date = results2[i].coupon_expire_date;
                expire_date = moment(server_expire_date).format("YYYY-MM-DD");
                var coupon_type = results2[i].coupon_type;
                var coupon_value = results2[i].coupon_value;

                if (new Date(expire_date) >= new Date(current_date)) {
                  if (coupon_type == 1) {
                    var discout_product_price = product_price - coupon_value;

                    var json = JSON.stringify({
                      status: "200",
                      result: "" + discout_product_price
                    });
                    res.end(json);
                  } else {
                    var discout_product_price =
                      (product_price * coupon_value) / 100;
                    console.log(
                      "product_discount_price" + discout_product_price
                    );
                    var json = JSON.stringify({
                      status: "200",
                      result: "" + discout_product_price
                    });
                    res.end(json);
                  }
                }

                //this is expire date else condition
                else {
                  var json = JSON.stringify({
                    status: "200",
                    message: "Coupon Date Expire"
                  });
                  res.end(json);
                }
              }
            } else {
              var json = JSON.stringify({
                status: "200",
                message: "coupon is not valid for this product"
              });
              res.end(json);
            }
          });
        // } else {
        //   var json = JSON.stringify({
        //     status: "200",
        //     result: "Coupon is not valid for this product"
        //   });
        //   res.end(json);
        // }
      // });
    } else {
      var json = JSON.stringify({
        status: "400",
        result: "unvalid token"
      });
      res.end(json);
    }
  });
    }
  })

});

user_image_module.post("/product_order", (req, res) => {
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
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
      res.end(json);
    }
      else{
      
  var user_id = req.body.user_id;
     var  token = req.body.token;
     var coupon_id=req.body.coupon_id;
     var address=req.body.address;
     var order_date=req.body.order_date;

 
     
      queryString = "SELECT * FROM user WHERE user.id=? AND user.token=?";
      con.query(queryString, [user_id, token], function(error, results, field) {
        if (results.length > 0) {
          queryString =
            "INSERT INTO orders(coupon_id,address,order_date) VALUES (?,?,?)";
          con.query(queryString, [coupon_id,address,order_date], function(error1, result1, field) {
            if (error1) {
             

              var json = JSON.stringify({
                status: "200",
                results: "Sorry boss"
              });
              res.header("Access-Control-Allow-Origin", "*");
              res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
              res.send(json);
            } else {
              var total_price,product_id,product_quantity;
           


              var order_id=result1.insertId
              var array=JSON.parse(req.body.order_array)
              console.log("length "+array.length);
              for(var i=0;i<array.length;i++){
                console.log("id--"+array[i].product_id)
                product_id=array[i].product_id;
                total_price=array[i].total_price;
                product_quantity=array[i].product_quantity;
        

                queryString="INSERT INTO order_product(order_id,product_id,product_quantity,total_price) VALUES (?,?,?,?)";
              con.query(queryString,[order_id,product_id,product_quantity,total_price],function(error2,result2){
                if(error2){
                  console.log("error")
               
                  // var json = JSON.stringify({
                  //   status: "200",
                  //   result: " Sorry"
                  // });
                  // res.header("Access-Control-Allow-Origin", "*");
                  // res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
                  // res.send(json);
                }

                else{
                 
                  // var json = JSON.stringify({
                  //   status: "200",
                  //   result: "Successfully order"
                  // });
                  // res.header("Access-Control-Allow-Origin", "*");
                  // res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
                  // res.send(json);
                  console.log("success")
                }

              })





              }
      
             
             

            

            }
          });
        } else {
          var json = JSON.stringify({
            status: "200",
            result: "Unvalid user"
          });
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "X-Requested-With"); 
          res.send(json);
        }
      });

    

        }
  })

});

user_image_module.post("/user_all_coupon_with_category", (req, res) => {
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
    }
    else{

      
  var token = req.body.token;
  var user_id = req.body.user_id;
  // var category_id = req.body.category_id;
  // var user_name;
  // var coupon_id;
  // var coupon_codee;
  // var result_array = [];
  // var myObject = {};
  // var coupon_value;

  const queryString = "SELECT * FROM user WHERE user.id=? AND user.token=?";

  con.query(queryString, [user_id, token], function(error, results, fields) {
    if (results.length > 0) {
      for (j in results) {
        user_name = results[j].user_name;
      }

      const queryString =
        "SELECT user_coupon.user_id,user_coupon.coupon_id,coupon.category_id,coupon.coupon_code,category.category_name FROM user_coupon INNER JOIN coupon ON user_coupon.user_id=coupon.coupon_id INNER JOIN category ON coupon.category_id=category.category_id WHERE user_coupon.user_id=?";
      con.query(queryString, [user_id], function(error1, result1, fields1) {
        if (result1.length > 0) {
         
          var json = JSON.stringify({
            status: "200",
            message: result1
          });
          res.end(json);
        } else {
          var json = JSON.stringify({
            status: "200",
            message: "your have no valid coupon"
          });
          res.end(json);
        }
      });
    } else {
      //console.log(failed)
      var json = JSON.stringify({
        status: "true",
        message: "Invalid User"
      });
      res.end(json);
    }
  });

    }
  })

});

module.exports = user_image_module;
