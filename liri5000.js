require("dotenv").config();


//REQUIRES: Grab the Request & Moment and FS packages...
let request = require("request");
let moment = require('moment');
let chalk = require('chalk');
let fs = require("fs");
let columnify = require('columnify');
let inquirer = require('inquirer');


//The Spotify variables and requiring the keys
let Spotify = require('node-spotify-api');
let Twitter = require('twitter');
let keys = require('./keys');
let spotify = new Spotify(keys.spotify);
let twitter = new Twitter(keys.twitter)

//ARGUMENTS: 
// Using position argv[2] for "app name" and slice to start request at position 3 of the array 
//(Since argv positions 0 and 1 are NODE & liri.js)

let app = "";
let args = [];

//Inquirer upgrade to standard Liri
inquirer
    .prompt([
        // Here we create a basic text prompt.
        // {
        //   type: "input",
        //   message: "What is your name?",
        //   name: "username"
        // },
        // Here we create a basic password-protected text prompt.
        // {
        //   type: "password",
        //   message: "Set your password",
        //   name: "password"
        // },
        // Here we give the user a list to choose from.
        {
            type: "list",
            message: "What Would You Like To Do?",
            choices: ["Movie Search", "Spotify Song Search", "Get My Tweets", "Concert Search", "Do What It Says"],
            name: "app"
        },
        // Here we ask the user to confirm.
        // {
        //   type: "confirm",
        //   message: "Are you sure:",
        //   name: "confirm",
        //   default: true
        // }
    ])
    .then(function (inquirerResponse) {
        
        // If the inquirerResponse confirms, we displays the inquirerResponse's username and pokemon from the answers.
        if (inquirerResponse.app === "Movie Search") {
            app = "movie-this";
            console.log("Cool, let's look for a movie");
            getSearch();
        }
        else if (inquirerResponse.app === "Spotify Song Search") {
            app = "spotify-this-song";
            console.log("Cool, let's look for a song")
            getSearch();
        }
        else if (inquirerResponse.app === "Get My Tweets") {
            app = "my-tweets";
            console.log("Cool, let's look at your latest Tweets");
            getSearch();
        }
        else if (inquirerResponse.app === "Concert Search") {
            app = "concert-this";
            console.log("Cool, let's look for a Concert");
            getSearch();
        }
        else if (inquirerResponse.app === "Do What It Says") {
            app = "do-what-it-says";
            console.log("Cool, let's see what command is in Random.Txt");
            getSearch();
        }
    });




//FUNCTIONS 
//All the functions plugged into the switch logic above

function getSearch() {

    if (app === "my-tweets" || app === "do-what-it-says" ){
        dispatch();
    } else{
    inquirer
        .prompt([
            {
                type: "input",
                message: "What should we look for?",
                name: "search"
            },
        ]).then(function (inquirerResponse) {
            args.push(inquirerResponse.search);
            dispatch();
        });
    }
}

function dispatch(){

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
        case "my-tweets":
            tweetIt();
            break;
        case "do-what-it-says":
            doIt();
            break;
        default:
            console.log('Your "Node Liri" Options are: movie-this, concert-this, spotify-this-song, my-tweets, do-what-it-says')
    }
}

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

            //repackaging up a new object with desired attributes...
            let movieObj = {
                Title: data.Title,
                Year: data.Year,
                IMDBRating: data.imdbRating,
                RT: data.Ratings[1].Value,
                Country: data.Country,
                Language: data.Language,
                Plot: data.Plot,
                Actors: data.Actors,
            }

            //... so it's easier to just send one thing to the console.log and the logIt function

            console.log(columnify(movieObj, { columns: ['DATA', 'VALUE'] }))

            // console.log(movieObj);
            logIt("Movie Search: " + JSON.stringify(movieObj));

            // console.log("Title: " + data.Title);
            // console.log("Year: " + data.Year);
            // console.log("IMDB Rating: " + data.imdbRating);
            // console.log("Rotten Tomatoes Rating: " + data.Ratings[1].Value);
            // console.log("Country: " + data.Country);
            // console.log("Language: " + data.Language);
            // console.log("Plot: " + data.Plot);
            // console.log("Actors: " + data.Actors);
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

            let concertObj = {
                Artist: args,
                Venue: data[0].venue.name,
                Location: data[0].venue.city,
                Date: moment(data[0].datetime).format("MM/DD/YYYY"),
            }

            //... so it's easier to just send one thing to the console.log and the logIt function
            console.log(concertObj);
            logIt("Concert Search: " + JSON.stringify(concertObj));

            // console.log("Venue Name: " + data[0].venue.name);
            // console.log("Venue Location: " + data[0].venue.city);
            //Moment package used to tidy up datetime key
            // console.log("Date of Event: " + moment(data[0].datetime).format("MM/DD/YYYY"));

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

            let theSignObj = {
                Artist: JSON.stringify(theSign.album.artists[0].name),
                Song: JSON.stringify(theSign.name),
                Preview: JSON.stringify(theSign.preview_url),
                Album: JSON.stringify(theSign.album.name),
            }

            console.log(columnify(theSignObj, { columns: ['DATA', 'VALUE'] }))
            logIt("Spotify Search: " + JSON.stringify(theSignObj));

            // console.log("Artist: " + JSON.stringify(theSign.album.artists[0].name));
            // console.log("Song Name: " + JSON.stringify(theSign.name));
            // console.log("Preview Link: " + JSON.stringify(theSign.preview_url));
            // console.log("Album: " + JSON.stringify(theSign.album.name));
        });

    } else {
        //if Args has values, then it runs this search
        spotify.search({ type: 'track', query: args }, function (err, data) {

            if (err) {
                return console.log('Error occurred: ' + err);
            }

            let song = data.tracks.items[0];

            let songObj = {
                Artist: JSON.stringify(song.album.artists[0].name),
                Song: JSON.stringify(song.name),
                Preview: JSON.stringify(song.preview_url),
                Album: JSON.stringify(song.album.name),
            }

            console.log(columnify(songObj, { columns: ['DATA', 'VALUE'] }))
            logIt("Spotify Search: " + JSON.stringify(songObj));

            // console.log("Artist: " + JSON.stringify(song.album.artists[0].name));
            // console.log("Song Name: " + JSON.stringify(song.name));
            // console.log("Preview Link: " + JSON.stringify(song.preview_url));
            // console.log("Album: " + JSON.stringify(song.album.name));
        });
    }

}

function tweetIt() {


    //Parameters. Show the tweets from my timeline. Limit to the last 20 tweets.
    let params = { screen_name: 'JoseaphMankin', limit: 20 };
    twitter.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {

            for (var i = 0; i < tweets.length; i++) {
                //output the tweets
                var myTweets =
                    //Display tweet number for each tweet. For example, the first tweet returned will be tweet #1, the second returned will be tweet #2, etc.
                    chalk.red("Tweet #" + (i + 1) + ": ") + chalk.green(tweets[i].text) + "\r\n" +
                    chalk.blue("Created at: " + tweets[i].created_at)
                console.log(myTweets);
                //output the results to the log.txt file.
                logIt("My Tweets: " + myTweets);
            }
        }
    });
}

function doIt() {

    // Running the readFile module that's inside of fs.
    // Stores the read information into the variable "data"
    fs.readFile("random.txt", "utf8", function (err, data) {
        if (err) {
            return console.log(err);
        } else {

            // Break the string down by comma separation and store the contents into the output array.
            let output = data.split(",");
            app = output[0];
            args = output.slice(1);
        }
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
            case "my-tweets":
                tweetIt();
                break;
            default:
                console.log("I don't understand the command in the file.")
        }



    });
}

//Function for writing to the log

function logIt(response) {
    fs.appendFile('log.txt', response + "\n", function (err) {
        if (err) throw err;
        console.log("Data Logged Sucessfully")
    })
}

