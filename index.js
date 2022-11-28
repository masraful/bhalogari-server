const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const stripe = require("stripe")("sk_test_51M6dPbA3ZG4diIzk2ukgq0msGkZgI2YLiWiOYfO7sUE5NSLsR6enbNdMfGVuALGhyiliWC7tnXnmmSLkTmfYikb300oV4w1iRW");
// console.log(stripe)

const app = express()
app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.juycps9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    try {

        const bookingCollection = client.db('Resale').collection('bookings')
        const categoryCollection = client.db('Resale').collection('Category')
        const carCollection = client.db('Resale').collection('Car')
        const userCollection = client.db('Resale').collection('users')
        const newServicesCollection = client.db('Resale').collection('addnewservices')
        const paymentsCollection = client.db('Resale').collection('payments')


        app.get('/category', async (req, res) => {
            const query = {};
            const users = await categoryCollection.find(query).toArray();
            res.send(users)

        });
        app.get('/menus/:id', async (req, res) => {
            //const products=req.body.category_id
            const category_id = req.params.id


            console.log(category_id)



            //const product=products.filter(c=>c.category_id === id)
            const query = { category_id: category_id }
            const result = await carCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingCollection.findOne(query);
            res.send(booking);
        })

        app.get('/carItems', async (req, res) => {
            const data = req.query.data;
            const items = await carCollection.find(data)
            // console.log(items)
            res.send(items)
        })
        app.get('/caritem', async (req, res) => {
            const query = {};
            const users = await carCollection.find(query).toArray();
            res.send(users)

        });
        app.post('/bookings', async (req, res) => {
            const booking = req.body
            const result = await bookingCollection.insertOne(booking)
            res.send(result)
        })
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const users = await bookingCollection.find(query).toArray();
            res.send(users)

        });
        app.get('/bookPayment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingCollection.findOne(query);
            res.send(booking);
        })
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result)
        });


        app.get('/allusers', async (req, res) => {
            const query = {};
            const users = await userCollection.find(query).toArray();
            res.send(users)
        });

        app.put('/users/verify/:id', async (req, res) => {

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });


        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await userCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        app.delete('/deleteUsers:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })
        app.delete('/oders:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })


        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ],

            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment)
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatedResult = await bookingCollection.updateOne(filter, updateDoc)
            res.send(result)
        });



        app.get("/alluser/seller/:email", async (req, res) => {
            const email = req.params.email;
            console.log(email);
            const query = { email };
            const users = await userCollection.findOne(query);
            console.log(users);
            res.send({ isSeller: users?.select === 'Seller' });
        });




        app.post('/products', async (req, res) => {
            const user = req.body;
            const result = await newServicesCollection.insertOne(user);
            res.send(result)
        });

        app.get('/addproduct', async (req, res) => {
            const query = {};
            const users = await newServicesCollection.find(query).toArray();
            res.send(users)

        });

    }
    finally {

    }
}
run().catch(err => console.log(err))


app.get('/', async (req, res) => {
    res.send('Bhalogari server is running')


})
app.listen(port, () => {
    console.log(`bhalogari server running ${port}`)
})