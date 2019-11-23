// Whenever someone clicks a "make comment" button
$("body").on("click", "#make-comment", function () {
  // Save the id
  let articleId = $(this).attr("data-id");
  $("#save-comment").attr("data-id", articleId);

  // Open modal after changing the save comment data-id with corresponding article
  $('#comment-modal').modal('show');
});

// When you click the save-comment button from modal
$("body").on("click", "#save-comment", function (event) {
  // Grab the id associated with the article from the submit button
  $('#comment-modal').modal('hide');
  let articleId = $(this).attr("data-id");

  // Run a PUT request to update saved value of article from false to true
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + articleId,
    data: {
      // Value taken from note textarea
      body: $("#comment-input").val().trim()
    }
  })
    // With that done
    .then(function (data) {
      location.reload();
      // Empty the notes section
      $("#comment-input").empty();
    })
    .catch(function (err) {
      console.log("Error in saving comment in app.js not working: " + err);
    });
});

// Does not work 100% ^
//************************************************************ */
// Works V
//whenever someone clicks on save article button
$("body").on("click", "#save-article", function (event) {
  // Grab the id associated with the article from the submit button
  let thisId = $(this).attr("data-id");
  console.log("Article saved with id: " + thisId);
  // Run a PUT request to update saved value of article from false to true
  $.ajax({
    method: "PUT",
    url: "/savedarticles/" + thisId,
  })
    // With that done
    .then(function (data) {
      // Log the response
      console.log("Data: " + data);
      location.reload();
    })
    .catch(function (err) {
      console.log("Error in article app.js not working: " + err);
    });
});

//when ever someone clicks to remove save button or unsave the article
$("body").on("click", "#unsave-article", function (event) {
  // Grab the id associated with the article from the submit button
  let thisId = $(this).attr("data-id");
  console.log("Article saved with id: " + thisId);
  // Run a PUT request to update saved value of article from false to true
  $.ajax({
    method: "PUT",
    url: "/unsavedarticles/" + thisId,
  })
    // With that done
    .then(function (data) {
      // Log the response
      location.reload();
    })
    .catch(function (err) {
      console.log("Error in unsaving article app.js not working: " + err);
    });
});

//when someone clicks to view saved articles
$('#saved').on("click", function (event) {
  location.href = ('/saved');
});