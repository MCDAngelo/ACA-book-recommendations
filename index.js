import express from "express";

const port = 3000;
const app = express();

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.listen(port, () => {
    console.log(`Server running on port localhost:${port}`);
});