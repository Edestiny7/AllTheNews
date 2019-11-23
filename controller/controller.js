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
    //GET route for scraping the NPR News website
    app.get("/scrape", function (req, res) {

        // First, tell the console what server.js is doing
        console.log("\n****************************************************************\n" +
            "Grabbing each NPR News article's title, link, image, & summary\n" +
            "******************************************************************\n");

        // Grabbing the body of the html with a request via axios for npr's news
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
                console.log(result.title);

                async function create() {
                    await db.Article.create(result)
                }
                create()
            });

            /*                 //Prevent duplicates from being saved to db
                            if (result.title !== "" && result.link !== "") {
                                if (titleArray.indexOf(result.title) == -1) {
                                    titleArray.push(result.title);
            
                                    db.Article.countDocuments({ title: result.title }, function (err, test) {
                                        if (test === 0) {
                                            let entry = new db.Article(result);
            
                                            entry.save(function (err, doc) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    console.log(doc);
                                                }
                                            });
                                        }
                                    });
                                }
                                else {
                                    console.log("Article already exists");
                                } 
                            }
                            else {
                                console.log("Not saved to DB, missing data");
                            }*/
            //
            res.redirect("/");
        });
    });

    /*     app.post('/', function (req, res) {
            res.json(data);
        }); */

    //GET route for retrieving all unsaved articles from the db
    //this is for the root and uses index.handlebars
    app.get("/", function (req, res) {

        // Grab every document in the Articles collection
        db.Article.find({ saved: false }, function (err, result) {
            if (err) {
                console.log("Error in finding unsaved articles: " + err);
            }
            else {
                console.log("article results: " + JSON.stringify(result, null, 2));
                res.render("index", {
                    articles: result
                });
            }
        });
    });

    //PUT route which grabs id of article being saved and updates 'saved' from false to true
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

    //PUT route which grabs id of article being UNsaved and updates 'saved' from true to false
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
    //this is for the /saved path and uses saved.handlebars
    app.get("/saved", function (req, res) {
        //Query: in our database, go to the articles collection, 
        //then "find" every article that is saved (has a saved value of true);
        db.Article.find({ saved: true }).populate("notes").exec(function (error, result) {
            //Log any errors if server encounters one.
            if (error) {
                console.log("Error in getting saved articles: " + error);
            }
            //Otherwise, send the result of this query to the browser.
            else {
                console.log("Result: " + result);
                res.render("saved", {
                    articles: result,
                });
            }
        });
    });

    //DELETE route grabs id of article and deletes it from the db
    app.delete("/deletearticles/:id", function (req, res) {
        db.Article.findOneAndRemove({ _id: req.params.id })
            .then(function (result) {
                console.log("Article successfully deleted!");
                res.json(result);
            })
            .catch(function (err) {
                res.json(err);
                console.log("Error in finding saved articles: " + err);
            });
    });

    //Notes/Comment routes
    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", function (req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findOne({ _id: req.params.id })
            // ..and populate all of the notes associated with it
            .populate("notes")
            .then(function (dbArticle) {
                // If we were able to successfully find an Article with the given id, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
        console.log("ID : " + req.params.id)
    });

    // Route for saving a new Note to the db and associating it with an Article
    app.post("/articles/:id", function (req, res) {
        // Create a new note and pass the req.body to the entry
        db.Note.create(req.body)
            .then(function (dbNote) {
                // If a Note was created successfully, find one Article and push the new Note's _id to the Article's 'notes' array. 
                // { new: true } tells the query that we want it to return the updated Article -- it returns the original by default
                // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
            })
            .then(function (dbArticle) {
                // If we were able to successfully update an Article, send it back to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // If an error occurred, send it to the client
                res.json(err);
            });
    });


    /*     //route for creating a new comment
        app.get("/notes", function (req, res) {
            // Find all Notes
            db.Note.find({})
                .then(function (dbNote) {
                    // If all Notes are successfully found, send them back to the client
                    res.json(dbNote);
                })
                .catch(function (err) {
                    // If an error occurs, send the error back to the client
                    res.json(err);
                });
        }); */

    // Route for retrieving all Notes from the db
    app.get("/notes", function (req, res) {
        // Find all Notes
        db.Note.find({})
            .then(function (dbNote) {
                // If all Notes are successfully found, send them back to the client
                res.json(dbNote);
            })
            .catch(function (err) {
                // If an error occurs, send the error back to the client
                res.json(err);
            });
    });

    //Route for getting/finding all notes in the database associated with a particular headline/article.
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

    //Delete a note
    app.delete("/notes/:id", function (req, res) {
        // Remember: when searching by an id, the id needs to be passed in
        db.Note.deleteOne({ _id: req.params.id },
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