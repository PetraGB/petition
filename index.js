const express = require("express");
const app = express();

const db = require("./db");
const bc = require("./bc");

const cookieSession = require("cookie-session");

const csurf = require("csurf");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

// to be able to read input fields from url requests
app.use(
    require("body-parser").urlencoded({
        extended: false
    })
);

app.use(csurf());

// things we want in every single page
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "DENY");
    res.locals.csrfToken = req.csrfToken();
    next();
});

// set handlebars as engine
let hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// reusable string to forms where not all necessary fields are filled out
const notValid = "Oops, something is not working.";

app.get("/", (req, res) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.redirect("/register");
    }
});

app.get("/register", (req, res) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.render("register", {
            layout: "main"
        });
    }
});

app.post("/register", (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let email = req.body.email;
    let password = req.body.password;

    if (firstName == "" || lastName == "" || email == "" || password == "") {
        res.render("register", {
            layout: "main",
            notValid
        });
    } else {
        db.checkEmail(email).then(useCount => {
            if (useCount.rows[0].count > 0) {
                res.render("register", {
                    layout: "main",
                    notValid
                });
            } else {
                bc.hashPassword(req.body.password)
                    .then(hashedPassword => {
                        db.addUser(firstName, lastName, email, hashedPassword)
                            .then(userId => {
                                req.session.userId = userId.rows[0].id;
                                res.redirect("/profile");
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        });
    }
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

app.post("/profile", (req, res) => {
    let age = Number(req.body.age);
    let city = req.body.city;
    let url = req.body.url;
    let userId = req.session.userId;
    if (age == "" && city == "" && url == "") {
        res.redirect("/petition");
    } else {
        // check if url is filled out, if so clean URL
        db.addProfile(age, city, url, userId)
            .then(res.redirect("/petition"))
            .catch(err => {
                console.log(err);
            });
    }
});

app.get("/login", (req, res) => {
    if (req.session.sigId) {
        res.redirect("/thanks");
    } else if (req.session.userId) {
        res.redirect("/petition");
    } else {
        res.render("login", {
            layout: "main"
        });
    }
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if (email == "" || password == "") {
        res.render("login", {
            layout: "main",
            notValid
        });
    } else {
        db.checkIdByEmail(email)
            .then(emailId => {
                if (emailId < 1) {
                    res.render("login", {
                        layout: "main",
                        notValid
                    });
                } else {
                    let userId = emailId.rows[0].id;
                    db.getPass(email)
                        .then(passwordData => {
                            const cryptedPass = passwordData.rows[0].password;
                            bc.checkPassword(password, cryptedPass)
                                .then(doesMatch => {
                                    if (doesMatch) {
                                        req.session.userId = userId;
                                        db.checkSignature(userId)
                                            .then(sigId => {
                                                if (sigId.rows.length < 1) {
                                                    res.redirect("/petition");
                                                } else {
                                                    req.session.sigId =
                                                        sigId.rows[0].id;
                                                    res.redirect("/thanks");
                                                }
                                            })
                                            .catch(err => {
                                                console.log(err);
                                            });
                                    } else {
                                        res.render("login", {
                                            layout: "main",
                                            notValid
                                        });
                                    }
                                })
                                .catch(err => {
                                    res.render("login", {
                                        layout: "main",
                                        notValid
                                    });
                                    console.log(err);
                                });
                        })
                        .catch(err => {
                            console.log(err);
                        });
                }
            })
            .catch(err => {
                console.log(err);
            });
    }
});

app.get("/petition", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/login");
    } else if (req.session.sigId) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main"
        });
    }
});

app.post("/petition", (req, res) => {
    let signatureUrl = req.body.signatureUrl;
    if (signatureUrl == "") {
        res.render("petition", {
            layout: "main",
            notValid
        });
    } else {
        const userId = req.session.userId;
        // db.checkSignature(userId)
        //     .then(sigId => {
        //         if (sigId.rows.length > 0) {
        //             req.session.sigId =
        //                 sigId.rows[0].id;
        //         }
        //         res.redirect("/thanks");
        //     })
        //     .catch(err => {
        //         console.log(err);
        //     });
        db.addSignature(signatureUrl, userId)
            .then(sigId => {
                req.session.sigId = sigId.rows[0].id;
                res.redirect("/thanks");
            })
            .catch(err => {
                console.log(err);
            });
    }
});

app.get("/thanks", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/login");
    } else if (!req.session.sigId) {
        res.redirect("/petition");
    } else {
        db.getCount()
            .then(signersCount => {
                let numberSigners = signersCount.rows[0].count;
                db.getSignature(req.session.sigId)
                    .then(sig => {
                        let signature = sig.rows[0].signature;
                        res.render("thanks", {
                            layout: "main",
                            numberSigners,
                            signature
                        });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            })
            .catch(err => {
                console.log(err);
            });
    }
});

app.get("/signers", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/login");
    } else if (!req.session.sigId) {
        res.redirect("/petition");
    } else {
        db.getSigners().then(namesObj => {
            let names = namesObj.rows;
            res.render("signers", {
                layout: "main",
                names
            });
        });
    }
});

app.get("/signers/:city", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/login");
    } else if (!req.session.sigId) {
        res.redirect("/petition");
    } else {
        let city = req.params.city;
        db.getCitySigners(city).then(namesObj => {
            let names = namesObj.rows;
            res.render("signers", {
                layout: "main",
                names
            });
        });
    }
});

app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});

app.use(express.static("./public"));

app.listen(8080, () => console.log("Petition"));
