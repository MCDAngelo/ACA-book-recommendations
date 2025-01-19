import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { stringSimilarity } from "string-similarity-js";
import {Book, Family, Recommendation, Year, getFamily, getYears, sequelize} from "./models.js";

const port = 3000;
const app = express();

const familyMembers = await getFamily();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

/////////////////////
// GET METHODS
/////////////////////
app.get("/", async (req, res) => {
    res.render("index.ejs");
});

app.get("/books/new", (req, res) => {
    console.log("Add new book");
    res.render("add_book.ejs");
});

function getPublicationYear(pubDateStr) {
    const pubDate = new Date(pubDateStr);
    return pubDate.getFullYear();
}

app.get("/recommendations/:recId", async (req, res) => {
    var recommendations = null;
    var errorMsg = null;
    console.log(parseInt(req.params.recId));
    try {
        recommendations = await Recommendation.findAll({
            where: {id: parseInt(req.params.recId)},
            include: [Book, Family],
        })
        console.log(recommendations.map(rec => rec.toJSON()));
    } catch (err) {
        console.error(err)
        errorMsg = "No matches, search for another recommendation";
    };
    if (errorMsg | recommendations.length < 1) {
        res.render("view_details.ejs", {error: errorMsg});
    } else {
        res.render("view_details.ejs", {rec: recommendations.map(rec => rec.toJSON())[0]});
    }
});

app.get("/recommendations/:recId/edit", async (req, res) => {
    var recommendation = null;
    var errorMsg = null;
    console.log(parseInt(req.params.recId));
    try {
        recommendation = await Recommendation.findByPk(parseInt(req.params.recId),
            {include: [Book, Family],}
        )
    } catch (err) {
        console.error(err)
        errorMsg = "Sorry, can't find that recommendation"
    };
    if (recommendation instanceof Recommendation) {
        const book = recommendation.toJSON().book
        console.log(book);
        res.render("add_details.ejs", {book: book, family: familyMembers, rec: recommendation.toJSON()});
    } else {
        res.render("add_details.ejs", {error: errorMsg});
    }
});

app.get("/years", async (req, res) => {
    var recs = null;
    var years = null;
    var errorMsg = null;
    try {
        var all_years = await getYears();
        recs = await Recommendation.findAll({
            include: [Book],
        });
        years = all_years.map(y => ({
            ...y,
            nBooks: 0
        }));
    }  catch (err) {
        errorMsg = "Hmm, I seem to have hit a snag, try refreshing.";
        console.log(err);
    } 
    if (errorMsg) {
        res.render("years.ejs", {error: errorMsg});
    }  else {
        var recJSON = recs.map(r => r.toJSON());
        console.log(recJSON);
        recJSON.reduce((p, c) => {
            var bookYear = years.find(y => y.acaYear === c.yearAcaYear)
            bookYear.nBooks += 1
        }, {});
        console.log(years); 
        res.render("years.ejs", {years: years});
    }

})

app.get("/years/:year", async (req, res) => {
    var errorMsg = null;
    var recommendations = null;
    console.log(parseInt(req.params.year));
    try {
        recommendations = await Recommendation.findAll({
            where: {yearAcaYear: parseInt(req.params.year)},
            include: [Book, Family],
        })
        console.log(recommendations.map(rec => rec.toJSON()));
    } catch (err) {
        console.error(err);
        errorMsg = "No matches, pick another year or add a recommendation";
    };
    if (recommendations.length > 0) {
        res.render("year.ejs", {recommendations: recommendations.map(rec => rec.toJSON())});
    } else {
        res.render("year.ejs", {error: errorMsg});
    }
});

/////////////////////
// POST METHODS
/////////////////////
app.post("/books/find", async (req, res) => {
    var errorMsg = "No books found, try again."
    console.log("Looking for book");
    console.log(req.body);
    var searchEndpoint = "https://www.googleapis.com/books/v1/volumes?q=";
    if (req.body.author !== "") {
        const author = req.body.author.replace(/ /g,"+");
        searchEndpoint += "+inauthor:" + author;
    }
    if (req.body.title !== "") {
        const title = req.body.title.replace(/ /g,"+");
        searchEndpoint += "+intitle:" + title;
    }
    searchEndpoint += "&key=" + process.env.GOOGLE_BOOKS_API_KEY;
    console.log(`Searching for books from ${searchEndpoint}`);
    try {
        const response = await axios.get(searchEndpoint);
        var rawBooks = response.data.items;
    } catch (err) {
        console.log(err)
        res.render("add_book.ejs", {error: errorMsg})
    };
    if (rawBooks) {
        var filteredBooks = rawBooks.filter(
            (book) => ("imageLinks" in book.volumeInfo & stringSimilarity(req. body.title, book.volumeInfo.title) > 0.7)
        );
        if (filteredBooks.length > 0) {
            console.log(`${filteredBooks.length} books found.`)
            res.render("confirm_book.ejs", {books:filteredBooks})
        } else {
            console.log("No books meeting the search criteria.")
           res.render("add_book.ejs", {error: errorMsg})
        }
    } else {
        console.log("No books meeting the search criteria.")
        res.render("add_book.ejs", {error: errorMsg})
    }
});

app.post("/books/add", async(req, res) => {
    var bookJson = null;
    console.log(req.body);
    var searchEndpoint = "https://www.googleapis.com/books/v1/volumes/";
    searchEndpoint += req.body.books + "?key=" + process.env.GOOGLE_BOOKS_API_KEY;
    console.log(`Retrieving book information from ${searchEndpoint}`);
    try {
        const searchResponse = await axios.get(searchEndpoint);
        bookJson = searchResponse.data.volumeInfo;
        console.log(bookJson)
    } catch (err) {
        var errorMsg = "Oops, there was a problem retrieving the book information from Google"
        console.log(err)
        res.render("add_book.ejs", {error: errorMsg})
    }
    if (bookJson) {
        const newBook = {
            googleId: req.body.books,
            title: bookJson.title,
            author: bookJson.authors[0],
            pubYear: getPublicationYear(bookJson.publishedDate),
            imageUrl: bookJson.imageLinks.thumbnail,
        };
        console.log(newBook);
        res.render("add_details.ejs", {book: newBook, family: familyMembers});
    }
})

app.post("/books/manual", async (req, res) => {
    console.log("Manually add book details");
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
        where: {
            title: formInput.title,
            author: formInput.author,
            pubYear: formInput.bookYear,
            imageUrl: formInput.imageUrl,
            googleBooksId: formInput.googleId,
        }
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
    res.redirect(`/recommendations/${newRecommendatin.id}`);
})

app.post("/recommendations/:recId/save-edit", async (req, res) => {
    const formInput = req.body;
    console.log("Form Input");
    console.log(formInput);
    const rec = await Recommendation.findByPk(parseInt(req.params.recId));
    const familyMember = await Family.findOne({
        attributes: ['id'],
        where: { firstName: formInput.recommendedBy}
    });
    const book = await Book.findByPk(rec.bookId);
    rec.set({
        familyId: familyMember.id,
        yearAcaYear: formInput.acaYear,
        notes: formInput.acaNotes,
    });
    book.set({
        title: formInput.title,
        author: formInput.author,
        pubYear: formInput.bookYear,
        imageUrl: formInput.imageUrl,
    })
    await rec.save();
    await book.save();
    console.log("The following changes have been saved:");
    console.log(rec.toJSON());
    console.log(book.toJSON());
    res.redirect(`/recommendations/${rec.id}`);
})



app.listen(port, () => {
    console.log(`Server running on port localhost:${port}`);
});