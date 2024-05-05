const express = require('express')
const app = express();
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const path = require('path')

const userModel = require('./models/user');
const postModel = require('./models/post');

app.set("view engine", 'ejs')

app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/register", async (req, res, next) => {

    res.render("register")
})

app.post("/register", async (req, res) => {

    const { username, email, password, age } = req.body;

    const user = await userModel.findOne({ email })

    if (user) {
        return res.send("Email Id already registered")
    }

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
            console.log("came here")
            const createdUser = await userModel.create({
                username,
                email,
                password: hash,
                age
            })
            console.log("created user => ", createdUser)
            const token = jwt.sign({ email: createdUser.email }, 'shhhhh');
            res.cookie('token', token)
            res.redirect("/login");
        });
    });



})

app.get('/login', isLoggedIn, (req, res) => {

    if (req.data) {
        res.redirect("/profile");
    } else {
        res.render("login")
    }

})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const fetchedUser = await userModel.findOne({ email })
    if (!fetchedUser) {
        res.send("Email not found!")
    }
    bcrypt.compare(password, fetchedUser.password, function (err, result) {
        if (!result) {
            res.send("Password do not match")
        } else {
            const token = jwt.sign({ email: fetchedUser.email }, 'shhhhh');
            res.cookie('token', token)
            res.redirect("/profile")
        }
    });
})

app.get("/profile", isLoggedIn, async (req, res) => {

    const fetchedUser = await userModel.findOne({ email: req.data.email })
    console.log(fetchedUser);

    res.render("profile", fetchedUser);
})

app.get("/post/create", async (req, res) => {

    const createdPost = await postModel.create({
        postData: "hey there what's up!",
        user: '66348ab837a695612345808f'
    })

    const fetchedUser = await userModel.findOne({ _id: '66348ab837a695612345808f' })
    fetchedUser.posts.push(createdPost._id);
    await fetchedUser.save()

    res.send({ createdPost, fetchedUser });

})

app.get("/logout", (req, res) => {

    res.cookie('token', '');
    res.render("logout");
})

// Middleware
async function isLoggedIn(req, res, next) {

    if (req.cookies.token === '') {
        if (req.url == "/login") {
            next();
        } else {
            res.redirect("/login")
        }

    } else {
        const decodedToken = jwt.verify(req.cookies.token, 'shhhhh');
        console.log("decoded token => ", decodedToken)
        // const loggedInUser = await userModel.findOne({ email: decodedToken.email })
        req.data = decodedToken;
        next();
    }
}


app.listen(3000, (req, res) => {
    console.log("Server started......")
})

