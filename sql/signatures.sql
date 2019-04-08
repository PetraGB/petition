DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    signature TEXT,
    user_id INTEGER,
    signed_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
