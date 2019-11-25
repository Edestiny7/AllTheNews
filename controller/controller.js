//Scraping tools
// Makes HTTP request for HTML page
let axios = require("axios");
// Parses our HTML and helps us find elements
let cheerio = require("cheerio");

// Requiring all models
let db = require("../models");

//Initializing Expresss
let express = require("express");
let app = express();

module.exports = function (app) {

    //GET route for retrieving unsaved articles from db
    app.get("/", function (req, res) {
        db.Article.find({ saved: false }, function (err, result) {
            if (err) {
                console.log("Error finding unsaved articles: " + err);
            }
            else {
                res.render("index", {
                    articles: result
                });
            }
        });
    });

    //GET route for scraping NPR News website
    app.get("/scrape", function (req, res) {

        // First, tell the console what server.js is doing
        console.log("\n****************************************************************\n" +
            "Grabbing each NPR News article's title, link, image, & summary\n" +
            "******************************************************************\n");

        // Getting body of html with a request via axios for NPR News
        axios.get("https://www.npr.org/sections/news/").then(function (response) {

            // Loading that into cheerio and saving it to $ for a shorthand selector
            let $ = cheerio.load(response.data);
            let titleArray = [];
            // With cheerio, find each article-tag with the "item" class
            // (i: iterator. element: the current element)
            $("article.item ").each(function (i, element) {

                // An empty array to save the data that we'll scrape
                let result = {};

                // Save the text of the h2 element in a "title" variable
                result.title = $(element).find("h2.title").text().trim();

                // Save the value of the h2 a element with an "href" attribute in a "link" variable 
                result.link = $(element).find("h2.title a").attr("href");

                // Save the text of the p element in a "summary" variable
                result.summary = $(element).find("p.teaser").text().trim();

                // Save the value of the div imagewrap a img element with a "src" attribute in an "image" variable 
                result.image = $(element).find("div.imagewrap a img").attr("src");

                // Save the text of the div slug-wrap h3 a element in a "slug" variable 
                result.slug = $(element).find("div.slug-wrap h3.slug a").text().trim();

                // Save the value of the div slug-wrap h3 a element with a "src" attribute in a "slugLink" variable 
                result.slugLink = $(element).find("div.slug-wrap h3.slug a").attr("href");

                // Log the results once you've looped through each of the elements found with cheerio
                //console.log(result.title);

                let entry = new db.Article(result);

                entry.save(function (err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(doc);
                    }
                });
            });
            res.redirect("/");
        });
    });

    //********************* */
    // Saved Articles Routes
    //********************* */

    //PUT route gets id of article being saved and updates 'saved' from false to true
    app.put("/savedarticles/:id", function (req, res) {

        db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true })
            .then(function (result) {
                console.log("Save successfull!");
                res.json(result);

            })
            .catch(function (err) {
                res.json(err);
                console.log("Error saving article: " + err);
            });
    });

    //PUT route gets id of article being UNsaved and updates 'saved' from true to false
    app.put("/unsavedarticles/:id", function (req, res) {

        db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: false })
            .then(function (result) {
                console.log("Article no longer saved!");
                res.json(result);

            })
            .catch(function (err) {
                res.json(err);
                console.log("Error removing article from save: " + err);
            });
    });

    //GET route for retrieving all saved articles
    app.get("/saved", function (req, res) {
        db.Article.find({ saved: true }).populate("notes").exec(function (error, result) {
            //Log errors
            if (error) {
                console.log("Error in getting saved articles: " + error);
            }
            //Otherwise, send result to browser
            else {
                res.render("saved", {
                    articles: result,
                });
            }
        });
    });

    //*****************/
    // Articles Routes
    //*****************/

    // GET Route for finding specific Articles & populating them with their referenced notes
    app.get("/articles/:id", function (req, res) {
        // Using id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
            // ..and populate all associated notes
            .populate("notes")
            .then(function (dbArticle) {
                // If successful, send to client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // Otherwise, send error
                res.json(err);
            });

    });

    // POST Route for saving to Notes schema and updating Article schema notes array
    app.post("/articles/:id", function (req, res) {
        db.Note.create(req.body)
            .then(function (dbNote) {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
            })
            .then(function (dbArticle) {
                // If successfull, send to client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // Otherwise, send error
                res.json(err);
            });
    });

    //**************/
    // Notes Routes
    //**************/

    // GET route for retrieving all Notes
    app.get("/notes", function (req, res) {
        db.Note.find({})
            .then(function (dbNote) {
                // If successful, send to client
                res.json(dbNote);
            })
            .catch(function (err) {
                // Otherwise, send error
                res.json(err);
            });
    });

    // GET route for retrieving all Notes associated with an article
    app.get("/notes/:id", function (req, res) {
        if (req.params.id) {
            db.Note.find({
                "article": req.params.id
            })
                .exec(function (error, doc) {
                    if (error) {
                        console.log(error)
                    } else {
                        res.send(doc);
                    }
                });
        }
    });

    //DELETE route for deleting a note
    app.delete("/delete/notes/:id", function (req, res) {
        // Remember: when searching by an id, the id needs to be passed in
        let id = req.params.id;

        console.log("Delete: " + id);

        db.Note.findByIdAndRemove({ _id: id },
            function (err, data) {
                if (err) {
                    console.log(err);
                }
                else {
                    res.json(data);
                }
            });
    });
}