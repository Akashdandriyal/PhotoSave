const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');
const path = require('path');
const multer = require('multer');
// const nodemailer = require('nodemailer');

const user = require('./models/user');
const Image = require('./models/images');
const transporter = require('./util/nodemailer');
const cloudinary = require('./util/cloudinaryConfig');

require('dotenv').config();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use('/uploads', express.static('uploads'));

// connect to database
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

//logged user details
let loggedUser;


//Routes
app.get('/', (req, res) => {
    res.render("home");
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

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", (req, res) => {
    try {
        user.register(new user({
            email: req.body.email,
            username: req.body.username,
            name: req.body.name
        }), req.body.password, (err, user) => {
            if(err) {
                console.log(err);
                res.render("signup");
            }
            res.redirect(`/emailValidation?emailID=${req.body.email}`);
        });
    } catch(e) {
        res.json(e);
    }
});

app.get("/emailValidation", async (req, res) => {
    // Verification mail send
    try {
        let rand,mailOptions,host,link;
        rand=Math.random().toString(36).slice(2);
        host=req.get('host');
        link="http://"+req.get('host')+"/emailVerification?email="+req.query.emailID+"&code="+rand;
        ejs.renderFile(__dirname + "/mail/mail.ejs", { name: 'Stranger' }, async (err, data) => {
            if (err) {
                console.log(err);
            } else {
                mailOptions={
                    from: 'Photosave <admin@photosave.com>',
                    to : req.query.emailID,
                    subject : "Please confirm your Email account",
                    html : data
                }
                console.log(mailOptions);
                await user.findOne({email: req.query.emailID}, (err, doc) => {
                    if(doc) {
                        doc.code = rand;
                        doc.save(() => {
                            transporter.sendMail(mailOptions, (error, response) => {
                                if(error){
                                        console.log(error);
                                        //Removing the user details from database if failed to send the confirmation mail
                                        doc.remove();
                                        res.end("error");
                                }else{
                                        console.log("Message sent: " + response.message);
                                    res.render("emailValidation");
                                    }
                            });
                        });
                    }
                });
            }
        });
    } catch(e) {
        console.log(e);
    }
});

app.get("/emailVerification", async (req, res) => {
    try {
        let verificationMail = req.query.email;
        let verificationCode = req.query.code;
        user.findOne({email: verificationMail, code: verificationCode}, (err, doc) => {
            if(doc) {
                if(doc.verified) {
                    res.redirect("/login");
                } else {
                    doc.verified = true;
                    doc.save(() => {
                        res.send("verfied");
                    });
                }
            } else {
                res.status(404).send("User not found");
            }
        });
    } catch(e) {
        console.log(e);
    }
    
});

app.get("/logout", (req, res) => {
    req.logOut();
    loggedUser = undefined;
    res.redirect("/");
});

app.post("/validateUsername", async (req, res) => {
    let username = req.body.username;
    console.log(username);
    try {
        await user.findOne({username: username}, (err, doc) => {
            if(doc) {
                res.json({"found": true});
            } else {
                res.json({"found": false});
            }
        });
    } catch(e) {
        console.log(e);
    }
});

app.post('/validateLogin', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return res.json(err); }
      if (!user) { return res.json({"found": false}); }
      else {return res.json({"found": true});}
    })(req, res, next);
});

app.get("/userProfile", async (req, res) => {
    if (loggedUser !== undefined) {
        try {
            await Image.find({username: loggedUser.username, userId: loggedUser._id}, (err, docs) => {
                if(docs) {
                    console.log(docs);
                    if(docs !== null) {
                        res.render("userProfile", {name: loggedUser.name, username: loggedUser.username, imageData: docs});
                    } 
                } else {
                    let data = {
                        images: []
                    };
                    res.render("userProfile", {name: loggedUser.name, username: loggedUser.username, imageData: data});
                }
            });
        } catch(e) {
            res.send(e);
        }
    } else {
        res.redirect('/login');
    }
});

app.get("/data", async (req, res) => {
    let start = req.query.start;
    let end = req.query.end;
    if(loggedUser !== undefined) {
        try {
            await Image.find({username: loggedUser.username, userId: loggedUser._id, srno: {$gte: start, $lt: end}}, (err, docs) => {
                if(docs) {
                    console.log(docs);
                    if(docs !== null) {
                        res.send(docs);
                    } 
                }
            });
        } catch(e) {
            res.send(e);
        }
    }
});

app.post('/userProfile', upload.single('image'), async (req, res, next) => {
    try {
        await Image.countDocuments({username: loggedUser.username, userId: loggedUser._id}, async (err, count) => {
            console.log(count);
            if(count >= 0) {
                let result = await cloudinary.v2.uploader.upload(req.file.path);
                let newImage = new Image({
                    userId: loggedUser._id,
                    username: loggedUser.username,
                    name: req.body.name,
                    description: req.body.description,
                    srno: count,
                    timestamp: new Date(),
                    image: result.url,
                    image_id: result.public_id,
                    size: result.bytes
                });
                await newImage.save(() => {
                    res.redirect("/userProfile");
                });
            } else {
                res.redirect("/userProfile");
            }
        });
    } catch(e) {
        res.send(e);
    }
});

app.get('/userProfile/pictures', (req, res) => {
    res.render("pictures");
});

const isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
}

app.use((req, res, next) => {
    res.status(404).render('notFound')
});
  
  app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message
      }
    });
});

let port = 3000||process.env.port;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});