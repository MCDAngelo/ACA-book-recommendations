import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import {Year, FamilyMember, sequelize} from "./models.js";

const port = 3000;
const app = express();

async function getYears() {
    const yearsResponse = await Year.findAll({attributes: ['aca_year']});
    const years = yearsResponse.map(item => item.getDataValue('aca_year'));
    return years;
}

async function getFamily() {
    const familyResponse = await FamilyMember.findAll({attributes: ['first_name']});
    const names = familyResponse.map(item => item.getDataValue('first_name'));
    return names;
}

const familyMembers = await getFamily();
const years = await getYears();
console.log(years);

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    console.log(years);
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
    const newBook = {
        title: "",
        author: "",
        year: "",
    };
    if (req.body.books === "manualEntry") {
    } else {
        var searchEndpoint = "https://openlibrary.org/search.json?language=eng";
        searchEndpoint += "&" + req.body.books;
        console.log(`Retrieving book information from ${searchEndpoint}`);
        const searchResponse = await axios.get(searchEndpoint);
        const bookJson = cleanBookInfo(searchResponse.data.docs[0]);
        newBook.title = bookJson.title;
        newBook.author = bookJson.author_name;
        newBook.year = bookJson.first_publish_year;
        newBook.imageUrl = bookJson.imageUrl;
        newBook.imageUrlMedium = bookJson.imageUrl.replace("-S.jpg","-M.jpg");
    }
    console.log(newBook);
    res.render("add_details.ejs", {book: newBook, family: familyMembers});
})

app.post("/books/save", (req, res) => {
    console.log(req.body);
})

app.get("/:year", (req, res) => {
    console.log(parseInt(req.params.year));
    res.render("year.ejs");
});

app.listen(port, () => {
    console.log(`Server running on port localhost:${port}`);
});