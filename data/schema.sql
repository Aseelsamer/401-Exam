DROP TABLE IF EXISTS covid;

CREATE TABLE IF NOT EXISTS covid (
    id SERIAL PRIMARY KEY ,
    Country VARCHAR (255),
    Recovered VARCHAR (255),
    Confirmed VARCHAR(255),
    Deaths VARCHAR (255),
Date VARCHAR(255)
)
