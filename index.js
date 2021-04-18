const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const bodyParser = require('body-parser');
const cors = require('cors');
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
    const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");

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
        const adminData = req.body;
        adminCollection.insertOne(adminData)
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

    app.post('/bookings', (req, res) => {
        const email = req.body.email;
        const isAdmin = req.body.isAdmin;
        let filter = { email: email };
        if (isAdmin) {
            filter = {};
        }
        bookingCollection.find(filter)
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/addReview', (req, res) => {
        const review = req.body;
        reviewCollection.insertOne(review)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, documents) => {
                res.send(documents.length > 0);
            })
    })

    app.post('/toursByDestination', (req, res) => {
        const location = req.body.location;
        const type = req.body.type;
        let filter = { location: new RegExp(location, 'i'), type: new RegExp(type, 'i') };
        if(location === 'ALL'){
            filter = { type: new RegExp(type, 'i') };
        }
        toursCollection.find(filter)
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/tourSearch', (req, res) => {
        const title = req.body.search;
        toursCollection.find({title: new RegExp(title, 'i')})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/tours', (req, res) => {
        toursCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/tourById/:id', (req, res) => {
        const id = req.params.id;
        toursCollection.find({ _id: ObjectId(id) })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    app.delete('/deleteTour/:id', (req, res) => {
        toursCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send(result.deletedCount > 0);
            })
    })

    app.patch('/updateBooking', (req, res) => {
        const id = req.body.id;
        const status = req.body.status;
        bookingCollection.updateOne({ _id: ObjectId(id) },
            {
                $set: { status: status }
            })
            .then(result => {
                res.send(result.modifiedCount > 0);
            })
    });
    //   client.close();
});

app.listen(process.env.PORT || port);