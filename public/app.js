$(document).ready(function () {
  // "make-comment" button clicked in Saved Articles
  $("body").on("click", "#make-comment", function () {
    // Save id
    let articleId = $(this).attr("data-id");
    $("#save-comment").attr("data-id", articleId);

    // Open modal after updating save comment with data-id of corresponding article
    $('#comment-modal').modal('show');
    $('#comment-input').focus();
  });

  // "save-comment" button clicked from within comment-modal
  $("body").on("click", "#save-comment", function (event) {
    // Get id associated with article from submit button
    $('#comment-modal').modal('hide');
    let articleId = $(this).attr("data-id");

    // POST route saves user input gathered from comment-modal
    $.ajax({
      method: "POST",
      url: "/articles/" + articleId,
      data: {
        // Value taken from comment textarea
        body: $("#comment-input").val().trim()
      }
    })
      // Display data
      .then(function (data) {
        location.reload();
        // Empty comment section
        $("#comment-input").empty();
      })
      .catch(function (err) {
        console.log("Error saving comment: " + err);
      });
  });

  //"save-article" button clicked on home page moves article to saved page
  $("body").on("click", "#save-article", function (event) {
    // Grab id associated with article from submit button
    let thisId = $(this).attr("data-id");

    // Update 'saved' attribute of article from false to true
    $.ajax({
      method: "PUT",
      url: "/savedarticles/" + thisId,
    })
      // Refresh browser
      .then(function (data) {
        location.reload();
      })
      .catch(function (err) {
        console.log("Save Article Error: " + err);
      });
  });

  //"unsave-article" button clicked on saved page moves article back to home page
  $("body").on("click", "#unsave-article", function (event) {
    // Grab id associated with article from submit button
    let thisId = $(this).attr("data-id");

    // Update 'saved' attribute of article from true to false
    $.ajax({
      method: "PUT",
      url: "/unsavedarticles/" + thisId,
    })
      // Refresh browser
      .then(function (data) {
        location.reload();
      })
      .catch(function (err) {
        console.log("Remove From Save Error: " + err);
      });
  });

  //"delete-note" button clicked to delete note from Saved Article page
  $("body").on("click", "#delete-note", function (event) {
    // Grab id associated with article from submit button
    let noteId = $(this).attr("data-id");
    $("#delete-note").attr("data-id", noteId);

    // Deletes note from Notes schema
    $.ajax({
      method: "DELETE",
      url: "/delete/notes/" + noteId,
    })
      // Refresh browser
      .then(function (data) {
        location.reload();
      })
      .catch(function (err) {
        console.log("Error in deleting note: " + err);
      });
  });

  //View saved articles
  $('#saved').on("click", function (event) {
    location.href = ('/saved');
  });
});