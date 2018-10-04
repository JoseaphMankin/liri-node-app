// Grab the request package...
var request = require("request");

// Using slice to start request at position 2 of the array (Since 0 and 1 are occupied by NODE)
let args = process.argv.slice(2);
//Join back title with + in the middle, since that's the format IMDB uses
let movie = args.join("+");

if (movie === ""){
    movie = "Mr+Nobody";
}

// Request w/ specified parts of the returned JSON object
request ("http://www.omdbapi.com/?y=&plot=short&apikey=trilogy&t=" + movie, function(error, response, body){
  if (!error && response.statusCode === 200){
    console.log("Title: " + JSON.parse(body).Title);
    console.log("Year: " + JSON.parse(body).Year);
    console.log("IMDB Rating: " + JSON.parse(body).imdbRating);
    console.log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings[1].Value);
    console.log("Country: " + JSON.parse(body).Country);
    console.log("Language: " + JSON.parse(body).Language);
    console.log("Plot: " + JSON.parse(body).Plot);
    console.log("Actors: " + JSON.parse(body).Actors);
  }
});
