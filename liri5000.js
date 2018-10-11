require("dotenv").config();


//REQUIRES: Grab the Request & Moment and FS packages...
let request = require("request");
let moment = require('moment');
let chalk = require('chalk');
let fs = require("fs");
let columnify = require('columnify');
let inquirer = require('inquirer');
let weather = require('weather-js');


//The Spotify variables and requiring the keys
let Spotify = require('node-spotify-api');
let Twitter = require('twitter');
let keys = require('./keys');
let spotify = new Spotify(keys.spotify);
let twitter = new Twitter(keys.twitter)

//ARGUMENTS: 
// Using position argv[2] for "app name", empty now, to be filled from Inquirer
//(Since argv positions 0 and 1 are NODE & liri.js)

let app = "";
let args = [];

//Inquirer upgrade to standard Liri

function mainPrompt() {
    inquirer
        .prompt([

            // Here we give the user a list to choose from.
            {
                type: "list",
                message: "What Would You Like To Do?",
                choices: ["Movie Search", "Spotify Song Search", "Get My Tweets", "Concert Search", "Do What It Says", "Get the Weather"],
                name: "app"
            },
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
            else if (inquirerResponse.app === "Get the Weather") {
                console.log("Cool, Let's check the weather");
                askWhereToGo();
            }

        });
}

//Kicking off program calling mainPrompt above
mainPrompt();

//FUNCTIONS 
//All the functions plugged into the switch logic above

function getSearch() {
    args = [];

    if (app === "my-tweets" || app === "do-what-it-says") {
        dispatch();
    } else {
        inquirer
            .prompt([
                {
                    type: "input",
                    message: "What should we look for?",
                    name: "search"
                },
            ]).then(function (inquirerResponse) {
                if (inquirerResponse.search === ""){
                    args = [];
                    dispatch();
                }else{
                args.push(inquirerResponse.search);
                dispatch();
            }
            });
    }
}

function dispatch() {

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

            console.log(chalk.green(columnify(movieObj, {
                showHeaders: false,
                // columns: ['DATA', 'VALUE'], 
                maxWidth: 75
            })));

            // console.log(movieObj);
            logIt("Movie Search: " + JSON.stringify(movieObj));

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
                Artist: artist.replace(",", " "),
                Venue: data[0].venue.name,
                Location: data[0].venue.city,
                Date: moment(data[0].datetime).format("MM/DD/YYYY"),
            }

            //... so it's easier to just send one thing to the console.log and the logIt function
            console.log(chalk.green(columnify(concertObj, {
                showHeaders: false,
                maxWidth: 75
            })));
            logIt("Concert Search: " + JSON.stringify(concertObj));

        }
    });

}

function spotifyIt() {

    //If you leave blank, search for the "The Sign"
    if (args.length === 0 || args === "null") {
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

            console.log(chalk.green(columnify(theSignObj, {
                showHeaders: false,
                maxWidth: 75
            })));
            logIt("Spotify Search: " + JSON.stringify(theSignObj));

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

            console.log(chalk.green(columnify(songObj, {
                showHeaders: false,
                maxWidth: 75
            })));
            logIt("Spotify Search: " + JSON.stringify(songObj));

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
        searchAgain();
    })
}

//Hijacking the Weather Piece we did in class
function askWhichOne(results) {
    const places = results.map(l => l.location.name)
    inquirer.prompt([{
        type: 'list',
        message: 'which one do you mean?',
        name: 'place',
        choices: places
    }]).then(chosePlace => {
        const finals = results.filter(r => r.location.name === chosePlace.place)
        const final = finals[0]
        console.log(`It's currently ${final.current.temperature} °F in  ${chosePlace.place}`)

        if (final.current.feelslike < 65) {
            console.log(`It feels like ${final.current.feelslike} °F there, better bring a jacket`)
        } else {
            console.log('It\'s nice enough out, bring sunglasses')
        }
    })
}


function askWhereToGo() {
    inquirer.prompt([{
        type: 'input',
        message: 'Where do you want to go?',
        name: 'location'
    }]).then(response => {

        weather.find({ search: response.location, degreeType: 'F' }, function (err, results) {
            const places = results.map(l => l.location.name)
            if (places.length > 1) {
                askWhichOne(results)
            } else if (places.length === 1) {

                console.log(`I hear ${places[0]} is lovely this time of year`)
            } else {
                console.log('I haven\'t heard of that one, try somewhere else')
                askWhereToGo()
            }

        })

    })
}

function searchAgain() {
    inquirer
        .prompt([

            {
                type: "confirm",
                message: "Would You Like To Search for Something Else?",
                name: "goAgain"
            },
        ])
        .then(function (answer) {
            if (answer.goAgain === true) {
                mainPrompt();
            } else{
                console.log("Thanks for choosing Liri5000 for all your searching needs. See you real soon!")
            }
        });

}
