const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const Chart = require('chart.js');

const app = express();

// Connexion à la base de données MongoDB
mongoose
  .connect('mongodb://127.0.0.1:27017/titanic', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });

// Schéma des passagers
const PassengerSchema = new mongoose.Schema({
  PassengerId: Number,
  Survived: Number,
  Pclass: Number,
  Name: String,
  Sex: String,
  Age: Number,
  SibSp: Number,
  Parch: Number,
  Ticket: String,
  Fare: Number,
  Embarked: String,
  Cabin: String,
});

// Modèle des passagers
const PassengerModel = mongoose.model('passengers', PassengerSchema);

// Configuration de Passport.js
passport.use(
  new LocalStrategy((username, password, done) => {
    if (username === 'admin' && password === 'admin') {
      const user = { username: 'admin' };
      done(null, user);
    } else {
      done(null, false, { message: 'Invalid credentials' });
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  if (username === 'admin') {
    done(null, { username: 'admin' });
  } else {
    done(null, false);
  }
});

app.set('view engine', 'ejs');

app.use(express.static('styles'));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'ddd743552c64b8bb4791e9cb4e77f51404050f3ccaf0ca0c0269633af79e3ffc',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/passengers', isAuthenticated, async (req, res) => {
  try {
    const passengers = await PassengerModel.find({});
    res.json(passengers);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/search',
    failureRedirect: '/login',
  })
);

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

app.get('/search', isAuthenticated, (req, res) => {
  res.render('search');
});

app.post('/search', isAuthenticated, async (req, res) => {
  const { gender, age, passengerClass } = req.body;

  try {
    let query = {};

    if (gender) {
      query.Sex = gender;
    }

    if (age) {
      query.Age = age;
    }

    if (passengerClass) {
      query.Pclass = passengerClass;
    }

    const passengers = await PassengerModel.find(query);

    // Calcul des statistiques
    const matchingSurvivors = {
      male: passengers.filter((passenger) => passenger.Survived === 1 && passenger.Sex === 'male').length,
      female: passengers.filter((passenger) => passenger.Survived === 1 && passenger.Sex === 'female').length,
    };

    const matchingAges = passengers.map((passenger) => passenger.Age).filter((age) => age !== null);
    const matchingFares = passengers.map((passenger) => passenger.Fare).filter((fare) => fare !== null);

    const stats = {
      survivorsBySex: matchingSurvivors,
      averageAge: matchingAges.length > 0 ? matchingAges.reduce((a, b) => a + b, 0) / matchingAges.length : 0,
      averageFare: matchingFares.length > 0 ? matchingFares.reduce((a, b) => a + b, 0) / matchingFares.length : 0,
      ageStdDev: calculateStandardDeviation(matchingAges),
      fareStdDev: calculateStandardDeviation(matchingFares),
    };

    res.render('results', { passengers, stats, gender, age, passengerClass });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Fonction pour calculer l'écart type
function calculateStandardDeviation(data) {
  const average = data.reduce((a, b) => a + b, 0) / data.length;
  const deviations = data.map((x) => Math.pow(x - average, 2));
  const variance = deviations.reduce((a, b) => a + b, 0) / data.length;
  return Math.sqrt(variance);
}

app.listen(8000, () => {
  console.log('http://localhost:8000/login');
});
