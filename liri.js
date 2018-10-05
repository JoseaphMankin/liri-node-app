require("dotenv").config();


// Grab the request and moment packages...
var request = require("request");
var moment = require('moment');
var Spotify = require('node-spotify-api');
var keys = require('./keys');
var spotify = new Spotify(keys.spotify);
// Using position 2 for app name and slice to start request at position 3 of the array 
//(Since 0 is NODE and 1 is liri.js)

let app = process.argv[2];
let args = process.argv.slice(3);


if (app === "movie-this") {
    //Join back title with + in the middle, since that's the format IMDB uses
    let movie = args.join("+");

    if (movie === "") {
        movie = "Mr+Nobody";
    }

    // Request w/ specified parts of the returned JSON object
    request("http://www.omdbapi.com/?y=&plot=short&apikey=trilogy&t=" + movie, function (error, response, body) {
        if (!error && response.statusCode === 200) {
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
} else if (app === "concert-this") {

    //Join back title with + in the middle, since that's the format IMDB uses
    let artist = args.join("+");


    // Request w/ specified parts of the returned JSON object
    request("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp", function (error, response, body) {
        if (!error && response.statusCode === 200) {
            // console.log(JSON.parse(body)[0].venue);

            console.log("Venue Name: " + JSON.parse(body)[0].venue.name);
            console.log("Venue Location: " + JSON.parse(body)[0].venue.city);
            console.log("Date of Event: " + moment(JSON.parse(body)[0].datetime).format("MM/DD/YYYY"));

        }
    });

} else if (app === "spotify-this-song") {
    if (args.length === 0) {
        args = "The Sign Ace of Base";

        spotify.search({ type: 'track', query: args }, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
            }

            console.log("Artist: " + JSON.stringify(data.tracks.items[2].album.artists[0].name));
            console.log("Song Name: " + JSON.stringify(data.tracks.items[2].name));
            console.log("Preview Link: " + JSON.stringify(data.tracks.items[2].preview_url));
            console.log("Album: " + JSON.stringify(data.tracks.items[2].album.name));
        });

    } else {

        spotify.search({ type: 'track', query: args }, function (err, data) {


            if (err) {
                return console.log('Error occurred: ' + err);
            }

            console.log("Artist: " + JSON.stringify(data.tracks.items[0].album.artists[0].name));
            console.log("Song Name: " + JSON.stringify(data.tracks.items[0].name));
            console.log("Preview Link: " + JSON.stringify(data.tracks.items[0].preview_url));
            console.log("Album: " + JSON.stringify(data.tracks.items[0].album.name));
        });
    }

}