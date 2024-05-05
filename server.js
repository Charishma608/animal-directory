// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8001;
const MONGO_URL = 'mongodb://localhost:27017'; 
const DB_NAME = 'animal-directory'; 
const COLLECTION_NAME = 'animals'; 

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let db, animalsCollection;

// Connect to MongoDB
MongoClient.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);
    animalsCollection = db.collection(COLLECTION_NAME);
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the process if MongoDB connection fails
  });

// Routes
app.post('/animals', async (req, res) => {
  try {
    const newAnimal = req.body;
    const result = await animalsCollection.insertOne(newAnimal);
    res.status(201).json(result.ops[0]);
  } catch (err) {
    console.error('Error adding animal:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/animals/:id', async (req, res) => {
  try {
    const animalId = req.params.id;
    const updatedAnimal = req.body;
    const result = await animalsCollection.updateOne({ _id: new ObjectId(animalId) }, { $set: updatedAnimal });
    if (result.modifiedCount === 0) {
      res.status(404).json({ error: 'Animal not found' });
      return;
    }
    res.json(updatedAnimal);
  } catch (err) {
    console.error('Error updating animal:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/animals/:id', async (req, res) => {
  try {
    const animalId = req.params.id;
    const result = await animalsCollection.deleteOne({ _id: new ObjectId(animalId) });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Animal not found' });
      return;
    }
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting animal:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
