const express = require('express');
const mongoose = require('mongoose');
const scoreRouter = require('../routes/score');

//Setup modeled on this site:
//https://medium.com/@bmikkelsen22/designing-a-serverless-express-js-api-using-zeit-now-6e52aa962235

function getMongoString() {
  let mongoConnectString = process.env.DBCONNECT;
  mongoConnectString = mongoConnectString.replace(
    '<password>',
    process.env.DBPASSWORD
  );
  mongoConnectString = mongoConnectString.replace(
    '<username>',
    process.env.DBUSERNAME
  );
  return mongoConnectString;
}

// set up db connection
let mongoString = getMongoString();
mongoose.connect(mongoString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const app = express();
app.use(scoreRouter);

module.exports = app;
