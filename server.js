const EXPRESS = require("express");
const APP = EXPRESS();
const PORT = 9000;
const SERVER = APP.listen(PORT, (req, res) => {
	console.log(`server is listening to port ${PORT}`);
});
const IO = require("socket.io")(SERVER);

let bodyParser = require("body-parser");
let session = require("express-session");
APP.use(bodyParser.urlencoded({ extended: true }));

APP.use(
	session({
		secret: "secret",
		resave: false,
		saveUninitialized: true,
		cookie: { maxAge: 600000 },
	})
);

// for image/js/css
APP.use(EXPRESS.static(__dirname + "/static"));
// This sets the location where express will look for the ejs views
APP.set("views", __dirname + "/views");
// Now lets set the view engine itself so that express knows that we are using ejs as opposed to another templating engine like jade
APP.set("view engine", "ejs");
// use app.get method and pass it the base route '/' and a callback

let users = [];
let messages = [];
IO.on("connection", function (socket) {
	console.log(`a user is connected`);

	socket.on("new_connection", function (data) {
		console.log(data.msg);
		socket.emit("load_messages", { messages: messages });
		// socket.broadcast.emit("color", { data: color });
	});

	socket.on("add_user", function (data) {
		users.push(data.user);
		console.log(users);
	});

	socket.on("add_message", function (data) {
		console.log(data);
		let message = {
			name: data.message.from,
			message: data.message.message,
		};
		messages.push(message);
		socket.emit("load_messages", { messages: messages });
		socket.broadcast.emit("load_messages", { messages: messages });
	});

	socket.on("disconnect", function () {
		console.log(`a user is disconnected`);
	});
});

APP.get("/", (req, res) => {
	res.render("index");
});

APP.post("/add-user-to-chat-room", (req, res) => {
	res.json({ msg: "new user has join the chat room", name: req.body.name });
});

APP.post("/post-message", (req, res) => {
	res.json({ msg: "user send a message", message_details: req.body });
});

// APP.listen(PORT, (req, res) => {
// 	console.log(`Server is listening to ${PORT}`);
// });
