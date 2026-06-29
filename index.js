const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const uri = "mongodb://localhost:27017"
const cors = require("cors");
const dns = require("dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"])
app.use(cors());
app.use(express.urlencoded())
app.use(express.json());
app.use(cors({ origin: "*" }))
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        deprecationErrors: true,
        strict: true
    }
})
async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        const startupForge = client.db("startup_forge");
        const getOpportunities = startupForge.collection("opportunities")

        app.get("/opportunities", async (req, res) => {

            const data = await getOpportunities.find().toArray()
            console.log(data);

            res.send(data)
        });
        app.post("/opportunities", async (req, res) => {
            let newData = req.body;

            const newOpportunites = await getOpportunities.insertOne(newData);
            console.log(newData);
            console.log(newOpportunites);

            res.send(newData);
        })
        app.delete(`/deleteOpportunities/:id`, async (req, res) => {
            let id = req.params.id;
            const result = await getOpportunities.deleteOne({ _id: new ObjectId(id) })
            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }
                         
            res.send(result);
        })
    } catch (error) {
       await client.close();
        console.log(error);
    }
}
run().catch(console.dir)
app.listen(4400, () => {
    console.log("http://localhost:4400");
})