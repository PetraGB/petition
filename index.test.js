const supertest = require("supertest");
const { app } = require("./index.js");

const cookieSession = require("cookie-session");

test("Request to /login is successful", () => {
    return supertest(app)
        .get("/login")
        .then(res => {
            expect(res.statusCode).toBe(200);
        });
});

test("Logged out users redirected from petition to login", () => {
    cookieSession.mockSessionOnce({
        userId: false
    });
    return supertest(app)
        .get("/petition")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toContain("/login");
        });
});

test("Redirect from /login to petition for logged in users", () => {
    cookieSession.mockSessionOnce({
        userId: true
    });
    return supertest(app)
        .get("/login")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toContain("/petition");
        });
});

test("Redirect from registration to petition for logged in users", () => {
    cookieSession.mockSessionOnce({
        userId: true
    });
    return supertest(app)
        .get("/register")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toContain("/petition");
        });
});

test("Logged in users that signed are redirected to thanks", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        sigId: true
    });
    return supertest(app)
        .get("/petition")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toContain("/thanks");
        });
});

test("Logged in users that did not sign are redirected from thanks to petition", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        sigId: false
    });
    return supertest(app)
        .get("/thanks")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toContain("/petition");
        });
});

test("Logged in users that did not sign are redirected from signers to petition", () => {
    cookieSession.mockSessionOnce({
        userId: true,
        sigId: false
    });
    return supertest(app)
        .get("/signers")
        .then(res => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toContain("/petition");
        });
});
