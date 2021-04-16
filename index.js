const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a7xog.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('tours'));
app.use(fileUpload());

const port = 5000


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const toursCollection = client.db(`${process.env.DB_NAME}`).collection("tours");
    const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");
    const bookingCollection = client.db(`${process.env.DB_NAME}`).collection("booking");
    console.log("database connected");

    app.get('/', (req, res) => {
        res.send("It's Working");
    })

    app.post('/addTour', (req, res) => {
        const tourData = req.body;
        toursCollection.insertOne(tourData)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.post('/addAdmin', (req, res) => {
        const email = req.body;
        adminCollection.insertOne(email)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.post('/addBooking', (req, res) => {
        const bookingData = req.body;
        bookingCollection.insertOne(bookingData)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.get('/tours', (req, res) => {
        toursCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    })

    app.get('/tourById/:id', (req, res) => {
        const id = req.params.id;
        toursCollection.find({_id: ObjectId(id)})
        .toArray( (err, documents) => {
            res.send(documents[0]);
        })
    })

    app.delete('/deleteTour/:id', (req, res) => {
        toursCollection.deleteOne({_id: ObjectId(req.params.id)})
        .then(result => {
          res.send(result.deletedCount > 0);
        })
      })
//   client.close();
});

app.listen(port);