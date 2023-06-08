const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wt96dtg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const classCollection = client.db("summerCamp").collection("user");
    const userCollection = client.db("summerCamp").collection("users");

    // Get Data
    app.get("/class", async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    });

    // Get Data
    app.get("/users", async (req, res) => {
      const { email, selected } = req.query;
      let query = {};

      if (email && selected) {
        query = { email: email, selected: true };
        console.log(query);
      } else if (email) {
        query = { email: email };
      }

      try {
        const result = await userCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });


    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          email: 1,
          price: 1,
          userId: 1,
          image: 1,
          name: 1,
          availableSeats: 1,
          selected: 1,
        },
      };
    
      try {
        const result = await userCollection.findOne(query, options);
        res.send(result);
      } catch (error) {
        console.error("Error retrieving user:", error);
        res.status(500).send("Error retrieving user");
      }
    });
    

    // Post Data
    app.post("/users", async (req, res) => {
      const student = req.body;
      const result = await userCollection.insertOne(student);
      res.send(result);
    });


        // DElete
        // app.delete("/users/:id", async (req, res) => {
        //   const id = req.params.id;
        //   const query = { _id: new ObjectId(id) };
        //   const result = await userCollection.deleteOne(query);
        //   res.send(result);
        // });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running bro");
});

app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});
