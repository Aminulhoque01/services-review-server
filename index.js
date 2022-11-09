const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();

const port = process.env.PORT||5000;

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8qoxdwe.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection= client.db('reviewServices').collection('services');
        const reviewCollection = client.db('reviewServices').collection('review');
        app.get('/HomeServices', async(req,res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.limit(3).toArray();
            res.send(result)
        });

        app.get('/AllServices',async(req,res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });

        app.get('/AllServices/:id', async(req, res)=>{
           
            const id= req.params.id;

            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            
            res.send(service)

        });

        // reviews api
        app.get('/reviews',async(req,res)=>{
            
            let query = {};
            if(req.query.email){
                query ={
                    email:req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        })
        app.post('/reviews',async(req,res)=>{
            const order = req.body;
            const result = await reviewCollection.insertOne(order);
            res.send(result)
        });
        
        app.delete('/reviews/:id', async(req,res)=>{
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally{

    }
}
run().catch(error=>console.error(error))

app.get('/',(req,res)=>{
    res.send('services-review-running')
})

app.listen(port,()=>{
    console.log(`services-review-running:${port}`);
})