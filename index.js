const express = require('express');
const mongoose = require('mongoose');

// Configuration de la connexion MongoDB
const mongoURI = 'mongodb://localhost:27017/titanic'; // Remplacez 'localhost' par l'adresse de votre base de données si nécessaire
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Vérification de la connexion à la base de données
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB :'));
db.once('open', () => {
  console.log('Connecté à la base de données MongoDB');
  // Ici, vous pouvez exécuter d'autres actions liées à la base de données
});

// Votre code supplémentaire pour votre application backend peut suivre

// Exemple de définition d'un modèle de données
const Passenger = mongoose.model('Passenger', {
  name: String,
  age: Number,
  sex: String,
  // Ajoutez d'autres propriétés de modèle nécessaires
});

// Exemple de requête pour récupérer tous les passagers
app.get('/passengers', (req, res) => {
  Passenger.find((err, passengers) => {
    if (err) {
      console.error(err);
      res.status(500).send('Une erreur est survenue lors de la récupération des passagers');
    } else {
      res.json(passengers);
    }
  });
});

// Votre code supplémentaire pour les routes et les contrôleurs peut suivre

// Démarrage du serveur
const port = 3000; // ou tout autre port de votre choix
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
