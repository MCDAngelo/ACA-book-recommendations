import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const port = 3000;
const app = express();

const years = [2019, 2020, 2021, 2022, 2023];

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("index.ejs", {years: years});
});

app.get("/books/new", (req, res) => {
    console.log("Add new book");
    res.render("add_book.ejs");
});

function cleanBookInfo(book) {
    if (book.lccn) {
        book.idType = "lccn";
        book.id = book.lccn[0];
    } else if (book.oclc) {
        book.idType = "oclc";
        book.id = book.oclc[0];
    } else {
        book.idType = null;
        book.imageUrl = null;
    }
    book.imageUrl = `https://covers.openlibrary.org/b/${book.idType}/${book.id}-S.jpg`;
    return book;
}

app.post("/books/find", async (req, res) => {
    console.log("Looking for book");
    console.log(req.body);
    var searchEndpoint = "https://openlibrary.org/search.json?language=eng";
    if (req.body.author) {
        const author = req.body.author.replace(/ /g,"+");
        searchEndpoint += "&author=" + author;
    }
    if (req.body.title) {
        const title = req.body.title.replace(/ /g,"+");
        searchEndpoint += "&title=" + title;
    }
    console.log(`Searching for books from ${searchEndpoint}`);
    const response = await axios.get(searchEndpoint);
    var cleanedBooks = response.data.docs.map((book) => cleanBookInfo(book));
    var filteredBooks = cleanedBooks.filter((book) => book.idType !== null);
    console.log(filteredBooks.length);
    res.render("confirm_book.ejs", {books:filteredBooks})
});

app.post("/books/add", async(req, res) => {
    console.log(req.body);
    var searchEndpoint = "https://openlibrary.org/search.json?language=eng";
    searchEndpoint += "&" + req.body.books;
    console.log(`Retrieving book information from ${searchEndpoint}`);
    const searchResponse = await axios.get(searchEndpoint);
    // TODO: Use google books api to get descriptions https://developers.google.com/books/docs/v1/using#ids
    const bookJson = cleanBookInfo(searchResponse.data.docs[0]);
    const newBook = {};
    newBook.title = bookJson.title;
    newBook.author = bookJson.author_name;
    newBook.year = bookJson.first_publish_year;
    newBook.imageUrl = bookJson.imageUrl;
    newBook.imageUrlMedium = bookJson.imageUrl.replace("-S.jpg","-M.jpg");
    console.log(newBook);
    res.render("add_details.ejs", {book: newBook});
})

app.get("/:year", (req, res) => {
    console.log(parseInt(req.params.year));
    res.render("year.ejs");
});

app.listen(port, () => {
    console.log(`Server running on port localhost:${port}`);
});