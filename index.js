const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config();

const port = process.env.PORT||5000;

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8qoxdwe.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const reviewCollection= client.db('reviewServices').collection('services')
        
        app.get('/services', async(req,res)=>{
            const query = {};
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
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