const express = require('express');
const path = require('path');
const fs = require('fs');


const app = express();

app.set("view engine", "ejs")

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    fs.readdir("./files", (err, files) => {
        res.render("index", { "files": files })
    })

})

app.post("/create-task", (req, res) => {
    console.log(req.body);
    fs.writeFile(`./files/${req.body.title.split(' ').join('')}.txt`, req.body.details, (err) => {

    })
    res.redirect("/")
})

app.get("/task/:filename", (req, res) => {

    fs.readFile(`./files/${req.params.filename}`, (err, data) => {
        res.render("show", {
            "filename": req.params.filename,
            "contents": data
        })
    })
})

app.get("/edit/:filename", (req, res) => {
    res.render("edit", {
        "filename": req.params.filename
    })
})

app.post("/edit", (req, res) => {
    fs.rename(`./files/${req.body.previousFileName}`, `./files/${req.body.newFileName}`, (err) => {

    })
    res.redirect("/")
})



app.listen(3000, (req, res) => {
    console.log("Server running.......")
})

