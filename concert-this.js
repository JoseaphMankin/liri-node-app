// Grab the request package...
var request = require("request");
var moment = require('moment');


// Using slice to start request at position 2 of the array (Since 0 and 1 are occupied by NODE)
let args = process.argv.slice(2);
//Join back title with + in the middle, since that's the format IMDB uses
let artist = args.join("+");

// if (movie === ""){
//     movie = "Mr+Nobody";
// }

// Request w/ specified parts of the returned JSON object
request ("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp", function(error, response, body){
  if (!error && response.statusCode === 200){
    // console.log(JSON.parse(body)[0].venue);

    console.log("Venue Name: " + JSON.parse(body)[0].venue.name);
    console.log("Venue Location: " + JSON.parse(body)[0].venue.city);
    console.log("Date of Event: " + moment(JSON.parse(body)[0].datetime).format("MM/DD/YYYY"));
 
  }
});