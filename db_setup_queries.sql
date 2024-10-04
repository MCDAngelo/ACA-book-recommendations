CREATE TABLE IF NOT EXISTS family_members (
	id SERIAL PRIMARY KEY,
	first_name VARCHAR(20),
	last_name VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(250),
    author VARCHAR(150),
    pub_year INT
);

CREATE TABLE IF NOT EXISTS years (
	id SERIAL PRIMARY KEY,
	aca_year INT NOT NULL UNIQUE,
    pantone_color VARCHAR(20),
    pantone_color_hex CHAR(7)
);

CREATE TABLE IF NOT EXISTS book_recommendations (
    family_id INT REFERENCES family_members(id),
    book_id INT REFERENCES books(id),
    aca_year INT REFERENCES years(id),
    notes TEXT,
    PRIMARY KEY (family_id, book_id, aca_year) 
);

-- https://www.w3schools.com/colors/colors_trends.asp
INSERT INTO years (aca_year, pantone_color, pantone_color_hex)
VALUES
    (2019, 'Living Coral', '#FF6F61'),
    (2020, 'Classic Blue', '#0F4C81'),
    (2021, 'Illuminating', '#F5DF4D'),
    (2022, 'Veri Peri', '#6667AB'),
    (2023, 'Viva Magenta', '#BB2649'),
    (2024, 'Peach Fuzz', '#FFC196');




