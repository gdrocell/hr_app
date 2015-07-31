var http = require('http');
var fs = require('fs');
var crypto = require('crypto');
var qs = require("querystring");
var url = require('url');

var CustomSession = require('./lib/CustomSession.js');
var Configuration = require('./lib/Configuration.js');

/* User Session Generator */
var sessionGen = new CustomSession();

/* Configuration DAO */
var config = new Configuration();

/* Current Uuid for maintaining user session*/
var currentUuid = null;

/* constant value cookie for storing session */
const COOKIE_SESSION = "uuid";

const HTTP_SERVER_PORT = 8081;

var server = http.createServer(function(req, res) {
	var urlParts = url.parse(req.url);
	var path = urlParts.pathname;
	
	console.log("Url: " + req.url);
	if(path == "/admin_console" && (req.method == "POST" || req.method == "GET")) {
		login(req, res);
		return;
	}
	
	if(path == "/configuration") {
		if(req.method == "PUT") {
			createConfig(req, res);
		}
		else if(req.method == "GET") {
			retrieveConfig(req, res);
		}
		else if(req.method == "POST") {
			updateConfig(req,res);
		}
		else if(req.method == "DELETE") {
			deleteConfig(req, res);
		}
		
		return;
	}
	
	if(path == "/logout" && req.method == "POST") {
		logout(req,res);
		return;
	}
	
	
	
	fs.readFile("login.html", "utf8", function(err, data){
		res.writeHead(200, {"Content-Type": "text/html"});
		res.write(data);
		res.end();
	});
});

server.listen(HTTP_SERVER_PORT);
console.log("Server is Listening on port", HTTP_SERVER_PORT);

/**
 * Logs a user into the web app (admin console).
 * req - http request
 * res - http response
 */
function login(req, res) {
	var body = '';
	var cookies = getCookies(req);
	var uuid = cookies[COOKIE_SESSION];
	if(uuid == currentUuid) {
		displayResource(res, "admin_console.html", {"Content-Type": "text/html"});
		return;
	}
	
	req.on('data', function(data) {
		body += data;
	});
	
	req.on('end', function() {
		var postData = qs.parse(body);
		var username = postData.username;
		var password = postData.password;
		
		if(authenticated(username, password)) {
			currentUuid = createSession(req, res);

			displayResource(res, "admin_console.html", 
				{"Set-Cookie": COOKIE_SESSION + "=" + currentUuid, 
				"Content-Type": "text/html"});
		}
		else {
			forbidden(res);
		}
	});
}

/**
 * Logs a user out of the web app (admin console).
 * req - http request
 * res - http response
 */
function logout(req, res) {
	var cookies = getCookies(req);
	var uuid = cookies[COOKIE_SESSION];
	if(uuid == currentUuid) {
		res.writeHead(200, {"Content-Type" : "text/html", "Set-Cookie": ""});
		res.writeHead(301, {"Location": "/"});
		res.end();
		currentUuid = null;
	}
	else {
		forbidden(res);
	}
}

/**
 * Gives a forbidden response to the user.
 * res - http response
 */
function forbidden(res) {
	res.writeHead(403, {"Content-Type" : "text/html"});
	res.write("<h1>403 Forbidden</h1>");
	res.end();
}

/**
 * Creates a user session for the web app.
 * req - http request
 * res - http response
 */
function createSession(req, res) {
	var uuid = sessionGen.genUuid(undefined);
	return uuid;
}

/**
 * Determines if user logging in is authenticated.
 * return true if user is authenticated, false otherwise.
 */
function authenticated(user, pass) {
	if(user == undefined || pass == undefined) {
		return false;
	}
	
	var hashPass = crypto.createHash('md5').update(pass.trim()).digest('hex');
	return user.trim() == "admin" && hashPass.trim() == "43ae1750bb01ee9dda9686092ae47b27";
}

/**
 * Gets HTTP Session Cookies for current http request.
 * req - http request
 * return cookie map.
 */
function getCookies(req) {
	var cookieMap = {};
	var cookies = req.headers.cookie;
	cookies && cookies.split(";").forEach(function(cookie) {
		var parts = cookie.split("=");
		cookieMap[parts[0].trim()] = parts[1].trim();
	});
	
	return cookieMap;
}

/**
 * Reads a file and sends it as a response with headers.
 * res - http response
 * fname - file name to display to user.
 * headers - headers in http response.
 */
function displayResource(res, fname, headers) {
	fs.readFile(fname, "utf8", function(err, data){
		if(err) {
			console.error("Error: ", err);
		}
		res.writeHead(200, headers);
		res.write(data);
		res.end();
	});
}

function retrieveConfig(req, res) {
	var body = '';
	var cookies = getCookies(req);
	var uuid = cookies[COOKIE_SESSION];
	if(uuid == currentUuid) {
		var urlParts = url.parse(req.url);
		var query = urlParts.query;
		var index, count, sortBy;
		
		if(query != null) {
			var pq = qs.parse(query);
	
			if(pq.index != null) {
				index = parseInt(pq.index, 10);
			}
			if(pq.count != null) {
				count = parseInt(pq.count, 10);
			}
			
			if(pq.sort != null) {
				sortBy = pq.sort;
			}
		}
		
		var out = "";
		
		try {
			if(sortBy != null) {
				config.sort(sortBy);
			}
			
			if(index != null && count != null) {
				var page = config.page(index, count);
				out = JSON.stringify(page);
			}
			else {
				var allConfig = config.retrieve();
				out = JSON.stringify(allConfig);
			}
			res.writeHead(200, {"Content-Type": "text/json"});
			res.write(out);
			
		}
		catch(e) {
			res.writeHead(500, {});
		}	
		
		res.end();
	}
	else {
		forbidden(req, res);
	}
}

function createConfig(req, res) {
	var body = '';
	var cookies = getCookies(req);
	var uuid = cookies[COOKIE_SESSION];
	if(uuid == currentUuid) {
	
		req.on('data', function(data) {
			body += data;
		});
		
	
		req.on('end', function() {
			var postData = qs.parse(body);
			var name = postData.name;
			var hostname = postData.hostname;
			var port = parseInt(postData.port, 10);
			var username = postData.username;
			
			config.create(name, hostname, port, username);
			
			res.writeHead(201, {});
			res.end();
		});
	}
	else {
		forbidden(res);
	}
}

function updateConfig(req, res) {
	var body = '';
	var cookies = getCookies(req);
	var uuid = cookies[COOKIE_SESSION];
	
	if(uuid == currentUuid) {
		req.on('data', function(data) {
			body += data;
		});
		
		req.on('end', function() {
			var postData = qs.parse(body);
			var nameKey = postData.nameKey;
			var name = postData.name;
			var hostname = postData.hostname;
			var port = postData.port;
			var username = postData.username;

			config.update(nameKey,name,hostname,port,username);
			
			res.writeHead(200, {});
			res.end();
		});
	}
	else {
		forbidden(res);
	}
}

function deleteConfig(req, res) {
	var body = '';
	var cookies = getCookies(req);
	var uuid = cookies[COOKIE_SESSION];
	
	if(uuid == currentUuid) {
		req.on('data', function(data) {
			body += data;
		});
		
		req.on('end', function() {
			var postData = qs.parse(body);
			var nameKey = postData.nameKey;
			
			config.delete(nameKey);
			
			res.writeHead(200, {});
			res.end();
		});
	}
	else {
		forbidden(res);
	}
}
