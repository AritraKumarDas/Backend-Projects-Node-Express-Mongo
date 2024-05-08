const express = require('express')
const app = express();
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const path = require('path')
const upload = require('./config/multer-config')

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

            const createdUser = await userModel.create({
                username,
                email,
                password: hash,
                age
            })

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
        return;
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

    const fetchedUser = await userModel.findOne({ email: req.data.email }).populate("posts")
    // console.log(fetchedUser);

    res.render("profile", fetchedUser);
})

app.get("/profile/upload", isLoggedIn, async (req, res) => {

    res.render("upload")
})

app.post("/profile/upload", isLoggedIn, upload.single('profileImage'), async (req, res, next) => {
    const user = await userModel.findOne({ email: req.data.email })
    console.log(req.file)
    user.profileImage = req.file.filename;
    await user.save()
    res.redirect("/profile");
})

app.post("/create", isLoggedIn, async (req, res) => {
    const { postData } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.data.email })
    const createdPost = await postModel.create({
        postData,
        user: loggedInUser._id,
    })

    loggedInUser.posts.push(createdPost._id);
    await loggedInUser.save();
    res.redirect("/profile")


})

app.get("/post/like/:id", isLoggedIn, async (req, res) => {
    console.log("got to like...")
    const postId = req.params.id;
    const post = await postModel.findOne({ _id: postId });
    const loggedInUser = await userModel.findOne({ email: req.data.email });
    if (post.likes.indexOf(loggedInUser._id) === -1) {
        post.likes.push(loggedInUser._id);
    } else {
        post.likes.splice(post.likes.indexOf(loggedInUser._id), 1);
    }
    await post.save();
    res.redirect("/profile");

})

app.get("/post/edit/:id", isLoggedIn, async (req, res) => {
    const postId = req.params.id;
    const post = await postModel.findOne({ _id: postId });

    res.render("edit", { post: post })
})

app.post("/post/update/:id", isLoggedIn, async (req, res) => {
    const postId = req.params.id;
    const post = await postModel.findOneAndUpdate({ _id: postId }, { postData: req.body.postData });
    res.redirect("/profile")

})

app.get("/post/delete/:id", isLoggedIn, async (req, res) => {
    const postId = req.params.id;
    const post = await postModel.deleteOne({ _id: postId })
    console.log(post)
    const user = await userModel.findOne({ email: req.data.email })
    user.posts.splice(user.posts.indexOf(postId), 1)
    await user.save()
    res.redirect("/profile");
})

app.get("/logout", (req, res) => {

    res.cookie('token', '');
    res.render("logout");
})

app.get("*", (req, res) => {
    res.send("Page not found")
})

// Middleware
function isLoggedIn(req, res, next) {

    if ((!req.cookies.token) || (req.cookies.token === '')) {
        if (req.url == "/login") {
            next();
        } else {
            res.redirect("/login")
        }

    } else {
        const decodedToken = jwt.verify(req.cookies.token, 'shhhhh');
        // console.log("decoded token => ", decodedToken)
        req.data = decodedToken;
        next();
    }
}


app.listen(3000, (req, res) => {
    console.log("Server started......")
})

