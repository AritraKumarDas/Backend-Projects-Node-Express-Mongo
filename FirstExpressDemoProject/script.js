
const express = require('express');

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

app.use(express.static('./public'))

app.use((req, res, next) => {
    console.log(`Your requested URL =>  ${req.url}`)
    next();
})

app.use((req, res, next) => {
    console.log(`This is second middleware called`)
    next();
})

app.get('/', function (req, res) {
    res.render("index");
})

app.get('/contacts', function (req, res) {
    res.render("contacts");
})

app.get('/profile/:username', function (req, res) {
    res.render("profile", {
        username: req.params.username
    });
})

app.get('/error', function (req, res) {
    throw new Error("Something went wrong!")
});


app.use(function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }
    res.status(500)
    console.log(err)
    res.render('error', { error: err })
});


const PORT = 3002
app.listen(PORT, (req, res) => {
    console.log(`Wow, Server started in port no ${PORT}....`);
})
