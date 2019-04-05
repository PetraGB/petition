const spicedPg = require("spiced-pg");

const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

exports.addSignature = function addSignature(first_name, last_name, signature) {
    let q =
        "INSERT INTO signatures (first_name, last_name, signature) VALUES ($1, $2, $3) RETURNING id;";
    let params = [first_name, last_name, signature];
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
