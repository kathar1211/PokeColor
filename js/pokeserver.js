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
//var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var ip = '127.0.0.1';
const url = require('url');

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

//static library for images
var static = require('node-static');
var imageServer = new static.Server('../images');

//trying out getcolor library
const path = require('path');
const getColors = require('get-image-colors');


//Method to handle our page requests. The HTTP request from the browser will be
//automatically passed in as request. The pre-formatted response object will be
//automatically passed in as response so we can add to it and send it back.
function onRequest(request, response) {
    //Split after the ? mark to get the query string (key=value pairs)
    var parsedUrl = url.parse(request.url);
    
    
    //Parse the querystring into a JS object of variables and values
    //PARAMS MUST BE ENCODED WITH encodeURIComponent
    var params = queryString.parse(parsedUrl.query);
    //console.log(params);
    
    //check for image requests
    if(parsedUrl.pathname.substring(0,8) === '/images'){
        request.url = parsedUrl.pathname.substring(7);
        imageServer.serve(request, response);
        return;
    }
    
    //check if params does not have a url field (meaning no url came in request)
    if(!params.url && !params.pokemon) {
   
        //open up the home page
        response.writeHead(200, {"Content-Type":"text/html"});
        response.write(index);
        response.end();
        return;
    }
    
    //try in case URL is invalid or fails
    try{
        
        //here we need to check whether a pokemon request or an image request is happening
        
        //grab the query string from the parsedURL and parse it
        //into a usable object instead of a string
  
        //console.dir(parsedUrl);
        console.log(parsedUrl);
        
        /*else if (parsedUrl.pathname === "/color"){
            if (params.pokemon){
                var colors;
                getColors(path.join(__dirname, params.pokemon)).then(colors => {});
                response.writeHead(200, responseHeaders);
                response.write(JSON.stringify(colors));
                response.end();
            }
        }*/
            
        
        //write a 200 okay status code and send CORS headers to allow client to access this
        response.writeHead(200, responseHeaders);
    
        //make a request to the url and pipe (feed) the returned ajax call to our client response
        //Here we are connecting the next servers response back to our page.  
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

      response.end();
    }
}

//create an HTTP sever and forward all requests to onRequest.
//start listening on the specified port
http.createServer(onRequest).listen(port);

console.log("Listening on 127.0.0.1:" + port);