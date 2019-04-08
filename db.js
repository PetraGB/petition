const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.checkEmail = function checkEmail(email) {
    let q = "SELECT COUNT(*) FROM users WHERE email = $1;";
    let params = [email];
    return db.query(q, params);
};

exports.addUser = function addUser(first_name, last_name, email, password) {
    let q =
        "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id;";
    let params = [first_name, last_name, email, password];
    return db.query(q, params);
};

exports.addProfile = function addProfile(age, city, url, user_id) {
    let q =
        "INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id;";
    let params = [age || NULL, city || NULL, url || NULL, user_id];
    return db.query(q, params);
};

exports.getPass = function getPass(email) {
    let q = "SELECT password FROM users WHERE email=($1);";
    let params = [email];
    return db.query(q, params);
};

exports.addSignature = function addSignature(signature, user_id) {
    let q =
        "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id;";
    let params = [signature, user_id];
    return db.query(q, params);
};

exports.getCount = function getCount() {
    let q = "SELECT COUNT(*) FROM signatures;";
    return db.query(q);
};

exports.getSignature = function getSignature(id) {
    let q = "SELECT signature FROM signatures WHERE id=($1);";
    let params = [id];
    return db.query(q, params);
};

exports.getSigners = function getSigners() {
    let q = "SELECT first_name, last_name FROM signatures;";
    return db.query(q);
};
