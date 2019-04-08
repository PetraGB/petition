DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(200) NOT NULL,
    last_name VARCHAR(200) NOT NULL,
    signature TEXT,
    user_id INTEGER,
    signed_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
