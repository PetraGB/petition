const express = require("express");
const app = express();

const db = require("./db");

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

// app.use(require("cookie-parser")());

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main"
    });
});

app.post("/petition", (req, res) => {
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let signatureUrl = req.body.signatureUrl;
    let notValid = "Oops, something is not working.";
    if (firstName == "" || lastName == "" || signatureUrl == "") {
        res.render("petition", {
            layout: "main",
            notValid
        });
    } else {
        db.addSignature(firstName, lastName, signatureUrl)
            .then(sigId => {
                req.session.sigId = sigId.rows[0].id;
                console.log(req.session.id);
                res.redirect("/thanks");
            })
            .catch(err => {
                console.log(err);
            });
    }
});

app.get("/thanks", (req, res) => {
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
});

app.get("/signers", (req, res) => {
    db.getSigners().then(namesObj => {
        console.log(namesObj);
        let names = namesObj.rows;
        res.render("signers", {
            layout: "main",
            names
        });
    });
});

app.use(express.static("./public"));

app.listen(8080, () => console.log("Petition"));
