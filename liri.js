require("dotenv").config();


//REQUIRES: Grab the Request & Moment packages...
let request = require("request");
let moment = require('moment');

//The Spotify variables and requiring the keys
let Spotify = require('node-spotify-api');
let keys = require('./keys');
let spotify = new Spotify(keys.spotify);

//ARGUMENTS: 
// Using position argv[2] for "app name" and slice to start request at position 3 of the array 
//(Since argv positions 0 and 1 are NODE & liri.js)

let app = process.argv[2];
let args = process.argv.slice(3);

//LOGIC: 
//The 4 app calls you can perform. If you leave app blank, "default" lists your available options.

switch (app) {
    case "movie-this":
        movieIt();
        break;
    case "concert-this":
        concertIt();
        break;
    case "spotify-this-song":
        spotifyIt();
        break;
    case "do-what-it-says":
        doIt();
        break;
    default:
        console.log("Your Options are: movie-this, concert-this, spotify-this-song, do-what-it-says")
}

//FUNCTIONS 
//All the functions plugged into the switch logic above

function movieIt() {
    //Join back args with a + in the middle, since that's the format OMDB uses
    let movie = args.join("+");

    //If arguments left blank, just hardset the movie to Mr Nobody
    if (movie === "") {
        movie = "Mr+Nobody";
    }

    // OMDB Request w/ specified parts of the returned JSON object
    request("http://www.omdbapi.com/?y=&plot=short&apikey=trilogy&t=" + movie, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let data = JSON.parse(body);

            console.log("Title: " + data.Title);
            console.log("Year: " + data.Year);
            console.log("IMDB Rating: " + data.imdbRating);
            console.log("Rotten Tomatoes Rating: " + data.Ratings[1].Value);
            console.log("Country: " + data.Country);
            console.log("Language: " + data.Language);
            console.log("Plot: " + data.Plot);
            console.log("Actors: " + data.Actors);
        }
    });
}

function concertIt() {

    //Join back title with + in the middle, since that's the format BandsInTown uses
    let artist = args.join("+");


    // Request w/ specified parts of the returned JSON object
    request("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp", function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let data = JSON.parse(body);

            console.log("Venue Name: " + data[0].venue.name);
            console.log("Venue Location: " + data[0].venue.city);
            //Moment package used to tidy up datetime key
            console.log("Date of Event: " + moment(data[0].datetime).format("MM/DD/YYYY"));

        }
    });

}

function spotifyIt() {

    //If you leave blank, search for the "The Sign"
    if (args.length === 0) {
        args = "The Sign Ace of Base";

        spotify.search({ type: 'track', query: args }, function (err, data) {
            if (err) {
                return console.log('Error occurred: ' + err);
            }
            let theSign = data.tracks.items[2];

            console.log("Artist: " + JSON.stringify(theSign.album.artists[0].name));
            console.log("Song Name: " + JSON.stringify(theSign.name));
            console.log("Preview Link: " + JSON.stringify(theSign.preview_url));
            console.log("Album: " + JSON.stringify(theSign.album.name));
        });

    } else {
        //if Args has values, then it runs this search
        spotify.search({ type: 'track', query: args }, function (err, data) {

            if (err) {
                return console.log('Error occurred: ' + err);
            }

            let song = data.tracks.items[0];

            console.log("Artist: " + JSON.stringify(song.album.artists[0].name));
            console.log("Song Name: " + JSON.stringify(song.name));
            console.log("Preview Link: " + JSON.stringify(song.preview_url));
            console.log("Album: " + JSON.stringify(song.album.name));
        });
    }

}

function doIt() {
    console.log("Word Up")
}