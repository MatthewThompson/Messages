var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// Called when the server gets a delete request.
app.delete("/messages/*/", function (req, res) {
	
	var id = getIDfromURL(req.path);
	var filePath = "messages/" + id + ".txt";
	
	try {
		fs.unlinkSync(filePath); // Deletes the file.
		console.log("File: " + filePath + " deleted.");
	} catch (err) {
		res.send("Error : No such file exists.\n");
		return console.log("Error : " + filePath + " not deleted, no such file exists.\n");
	}
	
	res.send("Message " + id + " deleted successfully.\n");
	
})

// Called when there is a get request.
app.get("/messages/*/", function (req, res) {
	
	var id = getIDfromURL(req.path);
	var filePath = "messages/" + id + ".txt";
	
	var text;
	try {
		// Opens the file for reading.
		fs.openSync(filePath, "r");
		console.log("File: " + filePath + " opened.");
		
		
		// Read all the contents of the file into the variable 'text'.
		text = fs.readFileSync(filePath);
		console.log("File: " + filePath + " read.");
	
	} catch (err) { // User tries to read a message for an id which doesn't exist on the server.
		res.send("Error : No such file exists.\n");
		return console.log("File " + path + " not read, no such file exists.");
	}
	
	// Send the text back to the user.
	res.send(text + "\n");
	
})

// Called when data is posted to the server at domain/messages/. Used to add a message.
app.post("/messages", function (req, res) {
	
	var id;
	try {
		id = getID(); // Retrieve the id of the next message.
	} catch (err) {
		id = 1;
	}
	
	
	// Command to send a message: curl -d domain/messages "message"
	// This means data will be sent in the form {"message" : ""}.
	var text = Object.keys(req.body)[0];
	
	var filePath = "messages/" + id + ".txt";
	console.log(filePath + " : " + text);
	
	try {
		// Opens the file for writing, creating it if it does not exist.
		fs.openSync(filePath, "w");
		console.log("File: " + filePath + " created.");
		
		
		// Writes the message to the file.
		fs.writeFileSync(filePath, text);
		console.log("File saved.");
	} catch (err) {
		return console.log(err);
	}
	
	// Send the id of the created file back to the user.
	res.send("{\"id\":" + id + "}");
	id = parseInt(id) + 1;
	setID(id);
	
})

// Called when data is posted to the server at domain/messages/id/. Used to update a message.
app.post("/messages/*/", function (req, res) {
	
	var id = getIDfromURL(req.path);
	
	// Command to send a message: curl -d domain/messages "message"
	// This means data will be sent in the form {"message" : ""}.
	var text = Object.keys(req.body)[0];
	
	var filePath = "messages/" + id + ".txt";
	console.log(filePath + " : " + text);
	
	try {
		// Opens the file for writing, returning an error if it does not exist.
		fs.openSync(filePath, "r+");
		console.log("File: " + filePath + " opened.");
		
		// Writes the message to the file.
		fs.writeFileSync(filePath, text);
		console.log("File saved.");
		
	} catch (err) { // Error thrown if the file doesn't exist.
		res.send("The requested file does not exist.\n");
		return console.log("File " + filePath + " was not updated, file does not exist.");
	}
	
	res.send("File successfully updated.\n");
	
})

// Gets the ID (as a string) from a URL in the form domain/messages/id/
function getIDfromURL(URL) {
	
	var idStr = URL.substring(10); // Everything after "/messages/".
	
	for (var i = 0; i < idStr.length; i++) {
		
		if (idStr.charAt(i) == '/') {
			return idStr.substring(0, i); // Return everything up to the slash.
		}
		
	}
	
	return idStr;
	
}

// Gets the current ID.
function getID() {
	
	var filePath = "settings.json";
	
	fs.open(filePath, "r", (err, fd) => {
		if (err) {
			// If the settings file doesn't exist, create it and return the default ID (1).
			createSettings();
			return 1;
		}
	});
	
	var settings = JSON.parse(fs.readFileSync(filePath));
	
	return settings.id;
	
}

// Sets the ID to a given value.
function setID(id) {
	
	var filePath = "settings.json";
	
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
	try {
		fs.writeFileSync(filePath, JSON.stringify(settings));
	} catch (err) {
		return console.log(err);
	}
	
}

// Creates a settings.json file and initiates the values to default. To be called when the file does not exist.
function createSettings() {
	
	var filePath = "settings.json";
	var defaultSettings = "{\"id\":1}";
	
	try {
		// Opens the file for writing, creating it if it does not exist.
		fs.openSync(filePath, "w");
		console.log("File: " + filePath + " created.");
		
		// Writes the default values to the file.
		fs.writeFileSync(filePath, defaultSettings);
		console.log("Settings file saved.");
	} catch (err) {
			return console.log(err);
	}
	
}

// Start the app by listening on port 3000.
app.listen(3000, function () {
	console.log('Listening on port 3000...');
	
	// Tried to open the settings, and creates it if it does not exist.
	fs.open("settings.json", "r", (err, fd) => {
		if (err) {
			createSettings();
		}
	});
	
})



