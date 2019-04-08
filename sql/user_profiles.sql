DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles(
    id SERIAL PRIMARY KEY,
    age INTEGER,
    city VARCHAR(250),
    url VARCHAR(350),
    user_id INTEGER
);
