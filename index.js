const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT ||5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware...
app.use(cors())
app.use(express.json())



// Database collection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ungcn7e.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    
    //job portal database collection ...
    const jobCollections = client.db('jobDB').collection('jobs') 
    const applicationCollections = client.db('jobDB').collection('applicationJob') 

    // jobs collection...
    app.get('/jobs', async(req, res)=>{
        const cursor = await jobCollections.find().toArray()
        res.send(cursor)
    })

    app.get('/jobs/:id', async(req, res)=>{
      const id = req.params.id
      const query={_id : new ObjectId(id)}
      const result= await jobCollections.findOne(query)
      res.send(result)
    })

    // job application api...
    app.get('/job-application', async(req, res)=>{
      const email = req.query.email;
      const query= {applicantEmail: email}
      const result = await applicationCollections.find(query).toArray()

      for( const application of result){
        console.log(application.jobId);
         const query1={_id : new ObjectId(application.jobId)}
      const job= await jobCollections.findOne(query1)
      if(job){
        application.title= job.title;
        application.company = job.company;
        application.company_logo = job.company_logo;
      }
      }
      res.send(result)
    })


    app.post('/job-application', async(req, res)=>{
      const application = req.body;
      const result = await applicationCollections.insertOne(application)
      res.send(result)
    })

    app.delete('/job-application/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await applicationCollections.deleteOne(query)
      res.send(result)
    })
    




  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res)=>{
    res.send("Job Portal Server")
})

app.listen(port, ()=>{
    console.log(`Job portal server running on port : ${port}`);
})
