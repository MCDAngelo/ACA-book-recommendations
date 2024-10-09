import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import {Book, Family, Recommendation, Year, getFamily, getYears, sequelize} from "./models.js";

const port = 3000;
const app = express();

const familyMembers = await getFamily();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    res.render("index.ejs");
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
        pubYear: "",
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
        newBook.pubYear = bookJson.first_publish_year;
        newBook.imageUrl = bookJson.imageUrl;
        newBook.imageUrlMedium = bookJson.imageUrl.replace("-S.jpg","-M.jpg");
    }
    console.log(newBook);
    res.render("add_details.ejs", {book: newBook, family: familyMembers});
})

app.post("/books/manual", async (req, res) => {
    const formInput = req.body;
    console.log(formInput);
    const newBook = {
        title: formInput.title,
        author: formInput.author,
        pubYear: formInput.pubYear,
        imageUrl : formInput.imageUrl,
    };
    res.render("add_details.ejs", {book: newBook, family: familyMembers});
})

app.post("/books/save", async (req, res) => {
    const formInput = req.body;
    console.log(formInput);
    const bookResponse = await Book.findOrCreate({
        where: {title: formInput.title, author: formInput.author, pubYear: formInput.bookYear, imageUrl: formInput.imageUrl}
    });
    const newBook = bookResponse.map(item => item.dataValues)[0];
    console.log(newBook);
    const familyMember = await Family.findOne({
        attributes: ['id'],
        where: { firstName: formInput.recommendedBy}
    });
    console.log(familyMember.dataValues);
    const newRecommendation = await Recommendation.create({
        familyId: familyMember.id,
        bookId: newBook.id,
        yearAcaYear: formInput.acaYear,
        notes: formInput.acaNotes  
    });
    console.log("Added new recommendation:");
    console.log(newRecommendation.toJSON());
    res.redirect("/");
})

app.get("/years", async (req, res) => {
    const years = await getYears();
    console.log(years);
    res.render("years.ejs", {years: years});
})

app.get("/years/:year", async (req, res) => {
    console.log(parseInt(req.params.year));
    try {
        const recommendations = await Recommendation.findAll({
            where: {yearAcaYear: parseInt(req.params.year)},
            include: Book,
        })
        console.log(recommendations.map(rec => rec.toJSON()));
        if (recommendations.length > 0) {
            res.render("year.ejs", {recommendations: recommendations.map(rec => rec.toJSON())});
        } else {
            res.render("year.ejs", {error: `No matches, pick another year or add a past recommendation.`});
        }
    } catch (err) {
        console.error(err)
        res.render("year.ejs", {error: `No matches, pick another year or add a past recommendation.`});
    };
});

app.listen(port, () => {
    console.log(`Server running on port localhost:${port}`);
});