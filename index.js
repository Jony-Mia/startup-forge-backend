const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb")
const uri = "mongodb+srv://jony_mia:jony_mia_db@cluster0.faotqao.mongodb.net/?appName=Cluster0"
const cors = require("cors");
const dotenv = require("dotenv");
const port = 4400
const dns = require("dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config()
app.use(cors());

app.use(express.json());
app.use(cors({ origin: "*" }))
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        deprecationErrors: true,
        strict: true
    }
})
app.get("/", (req, res) => {
    res.send({
        message: "Everything is ok",
        status: true
    })
})
async function run() {
    try {

        const startupForge = client.db("startup_forge");
        const getOpportunities = startupForge.collection("opportunities")
        const startupList = startupForge.collection("startup_collection")
        app.get("/opportunities", async (req, res) => {

            const data = await getOpportunities.find().toArray()
            res.send(data)
        });
        app.post("/opportunities", async (req, res) => {
            let newData = req.body;
            const newOpportunites = await getOpportunities.insertOne(newData);

            res.send(newData);
        });
        app.get("/getStartup", async (req, res) => {
            let startupData = await startupList.find().toArray()
            res.send(startupData)
        });
        app.delete(`/deleteOpportunities/:id`, async (req, res) => {
            let id = req.params.id;
            const result = await getOpportunities.deleteOne({ _id: new ObjectId(id) })
            if (result.deletedCount === 1) {
                console.log("Successfully deleted one document.");
            } else {
                console.log("No documents matched the query. Deleted 0 documents.");
            }
            res.send(result);
        });

        app.post("/createStartup", async (req, res) => {
            let body = req.body;

            let startupData = body[0];
            startupData.image = body[1];

            const createStartup = await startupList.insertOne(startupData);

            res.send(body)
        });

        app.get("/singleStartup/:id", async (req, res) => {
            let id = await req.params.id;
            let singleData = await startupList.findOne({ _id: new ObjectId(id) })
            console.log(id);

            console.log(singleData);
            res.send(singleData);
        })
        app.patch("/editStartup/:id", async (req, res) => {
            let updated = await req.body;
            let id = await req.params.id;
            let filter = {
                _id: new ObjectId(id)
            }
            let bodyData = updated[0];
            bodyData.image = updated[1]
            let updateStartup = await startupList.updateOne(filter, {
                $set: bodyData
            })
            console.log(bodyData);
            res.send(bodyData)
        })
    } catch (error) {
        await client.close();
        console.log(error);
    }
}
run()
app.listen(port, () => {
    console.log("http://localhost:4400");
})