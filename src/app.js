const express = require("express");
const app = express();
const fs = require("fs");
// /config/config.json
// const config = fs.readFileSync("../config/config.json");
const config = fs.readFileSync(__dirname + "/../config/config.json");
const authKeyPath = __dirname + "/../AuthKey_X48L588XC4.p8";
const AppleAuth = require("apple-auth");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

let auth = new AppleAuth(
  config,
  fs.readFileSync(authKeyPath).toString(),
  "text"
);

app.get("/", (req, res) => {
  console.log(Date().toString() + "GET /");
  return res.send(`<a href="${auth.loginURL()}">Sign in with Apple</a>`);
});

app.get("/token", (req, res) => {
  return res.send(auth._tokenGenerator.generate());
});

app.post("/auth", bodyParser(), async (req, res) => {
  try {
    console.log(req);
    console.log(Date().toString() + "GET /auth");
    const response = await auth.accessToken(req.body.code);
    const idToken = jwt.decode(response.id_token);
    console.log({ response });
    console.log("body", req.body);
    const user = {};
    user.id = idToken.sub;
    console.log({ idToken });
    if (idToken?.email) user.email = idToken.email;
    if (idToken?.name) user.name = idToken.name;
    if (req.body.user) {
      //   console.log(req);
      const { name } = JSON.parse(req.body.user);
      user.name = name;
    }

    console.log({ user });
    return res.json(user);
  } catch (ex) {
    console.error(ex);
    return res.send("An error occurred!");
  }
});

app.get("/refresh", async (req, res) => {
  try {
    console.log(Date().toString() + "GET /refresh");
    const accessToken = await auth.refreshToken(req.query.refreshToken);
    res.json(accessToken);
  } catch (ex) {
    console.error(ex);
    res.send("An error occurred!");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Listening ");
});
