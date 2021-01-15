const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const user = require('./models/user');
const Image = require('./models/images');
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.MONGOURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    console.log("DB connected");
});

app.use(require('express-session')({
    //Decode and encode session
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

//Session encoding
passport.serializeUser(user.serializeUser());

//Session decoding
passport.deserializeUser(user.deserializeUser());

passport.use(new localStrategy(user.authenticate()))

app.use(passport.initialize());
app.use(passport.session());

let loggedUser;

//Multer
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,path.join(__dirname+'/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}`);
    }
});

let upload = multer({storage: storage});


//Routes
app.get('/', (req, res) => {
    res.render("home");
});

app.get("/userProfile", async (req, res) => {
    if (loggedUser !== undefined) {
        try {
            await Image.findOne({username: loggedUser.username, userId: loggedUser._id}, (err, docs) => {
                if(docs) {
                    console.log(docs);
                    if(docs !== null) {
                        res.render("userProfile", {name: loggedUser.name, imageData: docs});
                    } 
                } else {
                    let data = {
                        images: []
                    };
                    res.render("userProfile", {name: loggedUser.name, imageData: data});
                }
            });
        } catch(e) {
            res.send(e);
        }
    } else {
        res.redirect('/login');
    }
});

app.post('/userProfile', upload.single('image'), async (req, res, next) => {
    try {
        let obj = {
            name: req.body.name,
            description: req.body.description,
            timestamp: new Date(),
            image: {
                data: fs.readFileSync(path.join(`${__dirname}/uploads/${req.file.filename}`)),
                contentType: 'image/png'
            }
        }
        console.log(`obj= ${obj}`);
        await Image.findOne({username: loggedUser.username, userId: loggedUser._id}, (err, doc) => {
            if(doc) {
                doc.images.push(obj);
                doc.save(() => {
                    res.redirect("/userProfile");
                });
            } else {
                let newImage = new Image({
                    username: loggedUser.username,
                    userId: loggedUser._id,
                    images: obj
                });
                newImage.save(() => {
                    res.redirect("/userProfile");
                })
            }
        });
    } catch(e) {
        res.send(e);
    }
});

app.get("/login", (req, res) => {
    if(loggedUser === undefined) {
        res.render("login");
    } else {
        res.redirect("/userProfile");
    }
});

app.post("/login", passport.authenticate("local", {
    failureRedirect: "/login"
}), (req, res) => {
    loggedUser = req.user;
    console.log(loggedUser);
    res.redirect("/userProfile");
});

app.get("/signin", (req, res) => {
    res.render("signin");
});

app.post("/signin", (req, res) => {
    try {
        user.register(new user({
            username: req.body.username,
            name: req.body.name
        }), req.body.password, (err, user) => {
            if(err) {
                console.log(err);
                res.render("signin");
            }
            passport.authenticate("local")(req, res, () => {
                res.redirect("/login");
            });
        });
    } catch(e) {
        res.json(e);
    }
});

app.get("/logout", (req, res) => {
    req.logOut();
    loggedUser = undefined;
    res.redirect("/");
});

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
}

let port = 3000||process.env.port;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});