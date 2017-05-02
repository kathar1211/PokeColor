//import http package for running an HTTP server
var http = require('http');
//import query string package for decoding query strings
//and request parameters
var queryString = require('querystring');
//import request library for making ajax requests
/** 
  NOTE: The request library is NOT built into node.
  We installed this through NPM. It is now in our package.json.
  The package.json tells us which libraries and versions this 
  project uses. 
  
  The request library was installed by running this command
  in the directory that has the package.json file.
  
  npm install --save request
**/
var requestHandler = require('request');

//Which port should our process run on
//This says to use process.env.PORT if that is not null
//If it IS null, then use process.env.NODE_PORT.
//If that's null, then use 3000.
/**
  process.env.PORT and process.env.NODE_PORT are used by
  heroku.com and many other server companies if you want
  to host your project online. You won't be able to use 3000
  because those companies probably already have that and other
  ports in use. Instead they will assign you a private port
  as process.env.PORT or process.env.NODE_PORT
  
  process.env is the environment variables in node. They can
  be changed by configuration of node and operating system
  settings. 
  
  The process object itself also holds many other properties
  not just the environment properties. The process object
  holds information about the node process, process id, 
  runtime information, etc.
**/
//Set our port to process.env for hosted or 3000 for local
var port = process.env.PORT || process.env.NODE_PORT || 3000;
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

//Setup our headers for CORS support. This will allow CORS
//support in a browser page. 
/**
  access-control-allow-origin - the page URLS allowed to access CORS
  access-control-allow-methods - the HTTP methods allowed to run from the page
  access-control-allow-headers - the headers to accept from the client
  access-control-max-age - number of seconds to allow each request to come in from page
  content-type - the type of response we are sending back
**/
var responseHeaders = {  
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "Content-Type, accept",
    "access-control-max-age": 10,
    "Content-Type": "application/json"
};

var fs = require('fs');
var index = fs.readFileSync(__dirname + "/../index.html");

//Method to handle our page requests. The HTTP request from the browser will be
//automatically passed in as request. The pre-formatted response object will be
//automatically passed in as response so we can add to it and send it back.
function onRequest(request, response) {
    //Split after the ? mark to get the query string (key=value pairs)
    var query = request.url.split('?')[1];

    //Parse the querystring into a JS object of variables and values
    //PARAMS MUST BE ENCODED WITH encodeURIComponent
    var params = queryString.parse(query);
    
    //check if params does not have a url field (meaning no url came in request)
    if(!params.url) {
//      //write a 400 error code out
//      response.writeHead(400, responseHeaders);
//      
//      //json error message to respond with
//      var responseMessage = {
//        message: "Missing url parameter in request"
//      };
//      
//      //stringify JSON message and write it to response
//      response.write(JSON.stringify(responseMessage));
//      
//      //send response
//      response.end();
//      
//      //end this request by returning from this function
//      return;
        
        //open up the home page
        response.writeHead(200, {"Content-Type":"text/html"});
        response.write(index);
        response.end();
        return;
    }
    
    //try in case URL is invalid or fails
    try{
      //write a 200 okay status code and send CORS headers to allow client to access this
      response.writeHead(200, responseHeaders);
      
      //make a request to the url and pipe (feed) the returned ajax call to our client response
      //Here we are connecting the next servers response back to our page. 
        //var pokemon = JSON.parse(response);
        //var sprite = pokemon.sprites.front_default;
        //response = "<img src=" + sprite + ">";
        
      requestHandler(params.url).pipe(response);
    }
    catch(exception) {
      console.dir(exception);
      //write a 500 error out
      response.writeHead(500, responseHeaders);
      
      //json error message to respond with
      var responseMessage = {
        message: "Could not find Pokemon. Pokemon names must be spelled correctly and Pokemon numbers must be between 1 and 802."
      }
      
      //stringify JSON message and write it to response
      response.write(JSON.stringify(responseMessage));
      
      //get that pokemon sprite
      //var pokemon = JSON.parse(responseMessage);
      //var pokesprite = "<img src=" + pokemon.sprites.front_default + ">";
      //response.write("test");
      //response.write("<img src=" + pokemon.sprites.front_default + ">");
      //response.write(responseMessage);
      //send response
      response.end();
    }
}

//create an HTTP sever and forward all requests to onRequest.
//start listening on the specified port
http.createServer(onRequest).listen(port,ip);

console.log("Listening on 127.0.0.1:" + port);