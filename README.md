# Messages
A web service which allows users to store and retrieve plain text messages.


Usage:

Write a message to the server (the message id will be returned):
curl domain/messages/ -d "the message to store"


Read a message from the server with a known message id:
curl domain/messages/id


Delete a message from the server:
curl domain/messages/id -X "DELETE"


Update (overwrite) a message:
curl domain/messages/id -d "new message"
