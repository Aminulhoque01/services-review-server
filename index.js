const express = require('express');
const cors = require('cors');
const jwt= require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();

const port = process.env.PORT||5000;

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8qoxdwe.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
    const authHeader= req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message:'Unauthorized access'})
    }
    const token= authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
          return res.status(401).send({message:'unauthorized access'})
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
        const serviceCollection= client.db('reviewServices').collection('services');
        const reviewCollection = client.db('reviewServices').collection('review');
        
        app.post('/jwt', (req,res)=>{
            const user = req.body;
            const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'7d'});
            res.send({token})
        })
        
        
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
        app.get('/reviews',verifyJWT, async(req,res)=>{
            const decoded = req.decoded;
            console.log('inside orders api', decoded);
            
            if(decoded.email !== req.query.email){
                res.status(403).send({message:'unauthorized access'})
            }
            
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
        
        app.put('/reviews/:id', async(req,res)=>{
            const id = req.params.id;
            
            const filter= { _id:ObjectId(id)};
            const review = req.body;
            
            const options = { upsert: true }
            const updateReview = {
                $set:{
                    userName: review.userName,
                    serviceName: review.serviceName,
                    visit: review.visit,
                    email: review.email,
                    phone: review.phone,
                    textarea: review.textarea,

                }
            }
            const result= await reviewCollection.updateOne(filter,updateReview,options);
            res.send(result)
        })

        app.get('/reviews/:id', async(req,res)=>{
            const id = req.params.id;
            const query={ _id:ObjectId(id)}
            const result = await reviewCollection.findOne(query);
            res.send(result);
        })
        
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