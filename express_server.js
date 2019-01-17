const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const uuidv1 = require("uuid/v1");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var methodOverride = require("method-override");

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("X-HTTP-Method-Override"));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
const usersDb = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
  const id = uuidv1().substring(0, 6);
  // const alphanumeric =
  //   "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456759";
  // let result = [];
  // for (let i = 0; i < 6; i++) {
  //   result.push(alphanumeric[Math.floor(Math.random() * alphanumeric.length)]);
  // }

  // return result.join("");

  return id;
}

function checHTTP(longURL) {
  // a function to check if a version puts http or https inside the update url
  let start1 = longURL.slice(0, 7);
  let start2 = longURL.slice(0, 8);

  if (start1 !== "http://" && start2 !== "https://") {
    newURL = "//" + longURL;
    return newURL;
  } else {
    return longURL;
  }
}
//checkHTTP function was built and  help by Francis
// authentication function for log in usage not implemented
// const authenticateUser = (email, password) => {
//   //loop over the userDb object
//   // if the emails and passwords match, return the userId
//   // if not match is found, return false

//   for (const userId in usersDb) {
//     const user = usersDb[userId];
//     if (user.email === email && user.password === password) {
//       return user.id;
//     }
//   }
//   return false;
// };

app.post("/urls", (req, res) => {
  const randomId = generateRandomString();

  urlDatabase[randomId] = "http://www." + req.body.longURL;
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  res.cookie("cookieName", req.body.username);

  // extracting email and password from the form
  // const email = req.body.email;
  // const password = req.body.password;

  // const { email, password } = req.body;

  // // authenticate the user -> check if a user exists with this email and password
  // const userId = authenticateUser(email, password);

  // if (userId) {
  //   // if user is authenticated -> login
  //   // login means setting the cookie for that user
  //   // redirect to "/urls"
  //   res.cookie("userId", userId);
  //   res.redirect("/urls");
  // } else {
  //   // if the user is not found
  //   // error message "Wrong credentials"
  //   // redirect to login
  //   res.redirect("/login");
  // }
  res.redirect("/urls");
});

app.delete("/logout", (req, res) => {
  res.cookie("userId", null);
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

app.get("/urls", (req, res) => {
  let userId = req.cookies.userId;
  let currentUser = usersDb[userId];
  let username = req.cookies["cookieName"];
  let templateVars = {
    urls: urlDatabase,
    currentUser: currentUser,
    username: username
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // let longURL = ...
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = checHTTP(req.body.longURL);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
