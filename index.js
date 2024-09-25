import express from "express";

const port = 3000;
const app = express();

const years = [2019, 2020, 2021, 2022, 2023];

app.get("/", (req, res) => {
    res.render("index.ejs", {years: years});
})

app.listen(port, () => {
    console.log(`Server running on port localhost:${port}`);
});