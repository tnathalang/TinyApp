const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const uuidv1 = require("uuid/v1");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"]
  })
);

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
const urlDatabase = {
  b2xVn2: {
    userId: "userRandomID",
    longUrl: "http://www.lighthouselabs.ca"
  },

  "9sm5xK": { userId: "userRandomID", longUrl: "http://www.google.com" }
};

function generateRandomString() {
  const id = uuidv1().substring(0, 6);
  return id;
}

function checkHTTP(longUrl) {
  // a function to check if a version puts http or https inside the update longUrl
  let http = longUrl.slice(0, 7);
  let https = longUrl.slice(0, 8);

  if (http !== "http://" && https !== "https://") {
    newUrl = "http://" + longUrl;
    return newUrl;
  } else {
    return longUrl;
  }
}
//checkHTTP function was built and  help by Francis

const createUser = function(email, password) {
  const userId = generateRandomString();
  const newUser = {
    id: userId,
    email: email,
    password: password
  };
  usersDb[userId] = newUser;
  return userId;
};

const emailExist = function(email) {
  for (const userId in usersDb) {
    if (usersDb[userId].email === email) {
      return userId;
    }
    return false;
  }
};

function urlsForUser(id) {
  const filteredUrls = {};
  for (const shortUrl in urlDatabase) {
    const urlObj = urlDatabase[shortUrl];
    if (urlObj.userId === id) {
      filteredUrls[shortUrl] = urlObj;
    }
  }

  return filteredUrls;
}

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  templateVars = { currentUser: null, username: req.session.username };
  res.render("register", templateVars);
});

app.get("/", (req, res) => {
  let userId = req.session.userId;
  let currentUser = usersDb[userId];
  let username = currentUser ? currentUser.email : undefined;
  let templateVars = {
    urls: urlsForUser(userId),
    currentUser: currentUser,
    username: username
  };
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
  let userId = req.session.userId;
  let currentUser = usersDb[userId];

  let templateVars = {
    urls: currentUser ? urlsForUser(userId) : urlDatabase,
    currentUser: currentUser
  };

  res.render("urls_index", templateVars);
});
``;
app.get("/urls/new", (req, res) => {
  let userId = req.session.userId;
  let currentUser = usersDb[userId];
  let username = currentUser ? currentUser.email : undefined;
  let templateVars = {
    urls: urlDatabase,
    currentUser: currentUser,
    username: username
  };
  if (userId) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  if (!("userId" in req.session)) {
    return res.redirect("/");
  }

  let userId = req.session.userId;
  let currentUser = usersDb[userId];

  if (urlDatabase[req.params.id].userId !== currentUser.id) {
    return res.redirect("/urls");
  }

  let templateVars = {
    shortUrl: req.params.id,
    longUrl: urlDatabase[req.params.id],
    urls: urlDatabase,
    currentUser: currentUser,
    username: currentUser.email
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortUrl", (req, res) => {
  let longUrl = urlDatabase[req.params.shortUrl].longUrl;
  res.redirect(longUrl);
});

app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString();
  let userId = req.session.userId;
  let longUrl = checkHTTP(req.body.longUrl);

  urlDatabase[shortUrl] = { longUrl, shortUrl, userId };
  res.redirect("/");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const email_password_empty = !email || !password;
  if (email_password_empty) {
    res.status(400).send("Please send out the required fields");
  } else if (emailExist(email)) {
    res.status(400).send("User already exists. Please login!");
  } else {
    const userId = createUser(email, hashedPassword);

    req.session.userId = userId;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  for (let userId in usersDb) {
    if (
      usersDb[userId].email === req.body.email &&
      bcrypt.compareSync(req.body.password, usersDb[userId].password)
    ) {
      req.session.userId = usersDb[userId].id;
      res.redirect("/urls");
      return;
    }
  }
  res.send(
    "User is not found or incorrect password, please register or check if you input your password correctly"
  );
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id].longUrl = checkHTTP(req.body.longUrl);
  res.redirect("/urls");
});

app.delete("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
