var express = require('express');
var router = express.Router();

const userModel = require("./users");

const bcrypt = require('bcrypt');



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get("/create", async function (req, res, next) {
  const createdUser = await userModel.create({
    username: "aritra",
    name: "Aritra Das",
    age: 37
  })

  res.send(createdUser);
});

router.get("/all-users", async function (req, res, next) {
  const allUsers = await userModel.find();
  res.send(allUsers);
});

router.get("/find-one", async function (req, res, next) {
  const foundUser = await userModel.findOne({ username: "aritra" })
  res.send(foundUser);
});

router.get("/delete", async function (req, res, next) {
  const deletedUser = await userModel.findOneAndDelete({ age: 37 })
  res.send(deletedUser);
});

router.get("/create-session", (req, res) => {
  req.session.visitCount = 0;
  res.send("session created")
})

router.get("/read-session", (req, res) => {
  if (req.session.visitCount >= 0) {
    req.session.visitCount++
    res.send(`Visit count = ${req.session.visitCount}`)
  } else {
    res.send("session not created")
  }
})

router.get("/destroy-session", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw new Error
    }
  })
  res.send("session destroyed")
})

router.get("/set-cookie", (req, res) => {
  // res.cookie("name", "aritra")
  // res.send("cookie is now set")

  const saltRounds = 10
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash("myPlaintextPassword", salt, function (err, hash) {
      // Store hash in your password DB.
      console.log(salt)
      console.log(hash)
      res.send("bcrpt ran")
    });


  });


})

router.get("/read-cookie", (req, res) => {
  // if (req.cookies.name) {
  //   console.log(req.cookies.name);
  //   res.send(req.cookies.name)
  // } else {
  //   throw new Error("cookie not found")
  // }

  bcrypt.compare("myPlaintextPassword", hash, function (err, result) {
    // result == true
  });


})



module.exports = router;
