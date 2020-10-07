const { Router } = require('express');
const ScoreModel = require('../models/score');
var bodyParser = require('body-parser');
const { createCanvas, toBuffer, registerFont } = require('canvas');

const path = require('path');
// const fs = require('fs');

const router = Router();

const base = 100; //Score is returned one digit at a time, using this base

//Height of the image contains data about the response
const heights = {
  LAST_DIGIT: 1, //There are no more digits after this
  MORE_DIGITS: 2, //There is another digit
  ERROR: 3, //There's been an error
};

const pathToImage = path.join(__dirname, '..', 'img', 'img.png'); //1x1 standard success image
const pathToError = path.join(__dirname, '..', 'img', 'errImg.png'); //1x3 error image

//Middleware starts here

//Disable caching middleware
router.use(async (req, res, next) => {
  res.set({ 'Cache-Control': 'no-store' });
  next();
});

//Check for API key, but only on GET requests
router.get('*', async (req, res, next) => {
  if (!(req.query.key && req.query.key === process.env.API_KEY)) {
    console.log('UNAUTHORIZED');
    return res.sendFile(pathToError);
    // return res.status(401).send('Unauthorized');
  } else {
    next();
  }
});

router.use(bodyParser.json());

//Get all scores, this is for debugging
router.get('/score/', async (req, res) => {
  try {
    const query = ScoreModel.find({}).sort('-score');

    const scores = await query.exec();
    return res.send(scores);
  } catch (err) {
    return res.status(500).send(err);
  }
});

//Get the score
//Expects params:
//  digit - Which digit do we want, defaults to 1
//  nth - Which score, defaults to 3
//  key - API key
//Returns an image:
//  height = 1 if last digit, 2 if there's another digit
//  width = digit value + 1 (there can't be a 0-width image)
//  Image will be 1x3 if there's an error
router.get('/score/getScore', async (req, res) => {
  //key, digit,nth

  let height = heights.LAST_DIGIT;
  let digit = req.query.digit || 1;
  let nthScore = parseInt(req.query.nth) || 3;
  console.log(`Digit: ${digit}, Nth: ${nthScore}`);

  try {
    //Get the first nthScore records in the DB, sorted descending by score
    const query = ScoreModel.find({}).limit(nthScore).sort('-score');

    const scores = await query.exec();

    //Get the nth score
    const score = scores[nthScore - 1].score;
    console.log(score);

    let power = digit;

    let moreTerm = Math.pow(base, power) - 1;
    let moreDigits = score > moreTerm;

    if (moreDigits) {
      height = heights.MORE_DIGITS;
    }

    //The nth digit is (the remainder of dividing by base^n) divided by base^(n-1)
    let thisDigit = score % Math.pow(base, power);
    thisDigit = Math.floor(thisDigit / Math.pow(base, power - 1));
    console.log(`Final Digit: ${thisDigit}`);

    //Load the 1x1 sample image
    let width = thisDigit + 1; //Need to add one because you can't have a 0-sized image

    const canvas = createCanvas(width, height);
    const buf = await canvas.toBuffer();

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': buf.length,
    });

    return res.send(buf);
  } catch (err) {
    console.log('Errored getting score');
    console.log(err);
    return res.sendFile(pathToError);
  }
});

//This really shouldn't be a GET, but the only way to reach this route
//from CodeSkulptor is to make an image request so it has to be a GET
//Add a new high score (and remove the lowest high score from the list
//Expects params:
//  score - The high score
//  username - Name of scorer
//  key - API key
//Returns an image:
//  1x1 if sucess
//  1x3 if error
router.get('/score/updateScore', async (req, res) => {
  try {
    //score
    //username

    let score = req.query.score;
    let username = req.query.username;

    console.log(`New Score: ${score}, New User: ${username}`);

    const update = await ScoreModel.findOneAndReplace(
      {},
      { user: username, score },
      {
        new: true,
        sort: { score: 1 },
      }
    );

    return res.sendFile(pathToImage);
  } catch (err) {
    console.log('Errored updating');
    console.log(err);
    return res.sendFile(pathToError);
  }
});

router.get('/score/drawScore', async (req, res) => {
  try {
    const query = ScoreModel.find({}).limit(3).sort('-score');

    const scores = await query.exec();
    registerFont(path.join(__dirname, '..', 'fonts', 'ka2.otf'), {
      family: 'ka2',
    });
    let width = 500;
    let height = 150;

    const canvas = createCanvas(500, 150);
    const ctx = canvas.getContext('2d');

    ctx.font = '22pt ka2';
    ctx.fillStyle = 'rgb(246,255,0)';

    let msg = 'HIGH SCORES';

    let text = ctx.measureText('HIGH SCORES');

    let textX = width / 2 - text.width / 2;
    let textY = 28;

    ctx.fillText('HIGH SCORES', textX, textY);

    const dist = 40;
    const small_dist = 26;
    ctx.font = '14pt ka2';
    textY += dist;

    scores.forEach((score) => {
      const thisRow = `${score.user} :  ${score.score}`;
      let text = ctx.measureText(thisRow);
      textX = width / 2 - text.width / 2;
      ctx.fillText(thisRow, textX, textY);
      textY += small_dist;
    });

    const buf = await canvas.toBuffer();
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': buf.length,
    });

    return res.send(buf);
  } catch (err) {
    console.log('Errored drawing');
    console.log(err);
    return res.sendFile(pathToError);
  }
});

//Seed the db - deletes all current records and replaces with either test data or unknown data
//Request body should look like the following:
//  {"seedKey":"[SEED API KEY]","mode":"dev"}
//  SEED API KEY is private and not the same as the regular API key
//  mode is optional
//    if mode is not set, db will have three scores of 0 by "???"
//    if mode is "dev," db will have 10 randomly named high scores < 250
//Returns: all records in db
router.post('/score/reset-db', async (req, res) => {
  if (!(req.body.seedKey && req.body.seedKey === process.env['SEED_KEY'])) {
    console.log('UNAUTHORIZED');
    return res.status(401).send('Unauthorized');
  }
  console.log('Configuring DB');
  try {
    const removes = await ScoreModel.deleteMany({});
    console.log(`Deleted ${removes.deletedCount} records`);
    let users = [];
    const names = [
      'Denise',
      'Ada',
      'Taryn',
      'Chandler',
      'Harrison',
      'Alfredo',
      'Shiloh',
      'Journey',
      'Isiah',
      'Myles',
      'Iyana',
      'Brynlee',
    ];
    const devMode = req.body.mode && req.body.mode === 'dev';
    const userCount = devMode ? 10 : 3;
    for (let i = 0; i < userCount; i++) {
      let name = '???';
      let score = 0;
      if (devMode) {
        name = names[Math.floor(Math.random() * names.length)];
        score = Math.floor(Math.random() * 250);
      }
      let thisUser = {
        user: name,
        score,
      };
      users.push(thisUser);
    }

    const inserts = await ScoreModel.insertMany(users);

    return res.json(inserts);
  } catch (err) {
    console.log('Errored on config');
    return res.status(500).send(err);
  }
});

module.exports = router;
