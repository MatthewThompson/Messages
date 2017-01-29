var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// Called when...
app.get("/messages/*/", function (req, res) {
	
	console.log('Get method called.');
	console.log(req.path);
	
	var id = req.path.substring(10);
	var filePath = "/var/www/html/Messages/messages/" + id + ".txt";
	
	// Opens the file for reading.
	fs.open(filePath, "r", (err, fd) => {
		if (err) {
			//res.send("This file does not exist."); // This throws an error.
			return console.log(err);
		}
		
		console.log("File: " + filePath + " opened.");
		
	});
	
	// Read all the contents of the file into the variable 'text'.
	
	var text;
	try {
		text = fs.readFileSync(filePath);
	} catch (err) {
		return console.log(err);
	}
	
	// Send the text back to the user.
	res.send(text);
	
})

// Called when data is posted to the server.
app.post("/messages", function (req, res) {
	
	var id = getID();
	var text = Object.keys(req.body)[0];
	
	var filePath = "/var/www/html/Messages/messages/" + id + ".txt";
	
	console.log(filePath + " : " + text);
	
	// Opens the file for writing, creating it if it does not exist.
	fs.open(filePath, "w", (err, fd) => {
		if (err) {
			return console.log(err);
		}
		
		console.log("File: " + filePath + " created.");
		
	});
	
	// Writes the message to the file.
	fs.writeFile(filePath, text, (err) => {
		if (err) {
			return console.log(err);
		}
		
		console.log("File saved.");
	});
	
	// Send the id of the created file back to the user.
	res.send("{\"id\":" + id + "}");
	setID(parseInt(id) + 1);
	
})

// Gets the current ID.
function getID() {
	
	var filePath = "/var/www/html/Messages/settings.json";
	
	fs.open(filePath, "r", (err, fd) => {
		if (err) {
			return console.log(err);
		}
	});
	
	var settings = JSON.parse(fs.readFileSync(filePath));
	
	return settings.id;
	
}

// Sets the ID to a given value.
function setID(id) {
	
	var filePath = "/var/www/html/Messages/settings.json";
	
	// Open the settings JSON file.
	fs.open(filePath, "r+", (err, fd) => {
		if (err) {
			return console.log(err);
		}
	});
	
	// Parse the settings and store it in a variable.
	var settings = JSON.parse(fs.readFileSync(filePath));
	
	// Set the new id.
	settings.id = id;
	
	// Convert the JSON back to a string and write it back to the file.
	fs.writeFile(filePath, JSON.stringify(settings), (err) => {
		if (err) {
			return console.log(err);
		}
	}); 
	
}

//
app.listen(3000, function () {
	
	
	
	console.log('App listening on port 3000!');
})



