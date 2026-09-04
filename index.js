const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const dns = require("dns/promises")
// dotenv.config();

const app = express();
const port = 4400;
const allowedOrigin = /*process.env.CORS_ORIGIN || */ "*";
// const uri = /*process.env.MONGODB_URI ||*/ "mongodb+srv://jony_mia:jony_mia_db@cluster0.faotqao.mongodb.net/?appName=Cluster0";
const dbName = "startup_database";
const uri = "mongodb://localhost:27017"

app.use(cors({ origin: "*" }));
app.use(express.json());

const client = new MongoClient(uri);
dns.setServers(["1.1.1.1", "8.8.8.8"]);

async function run() {
    try {
        const db = client.db(dbName);
        const opportunities = db.collection("opportunities");
        const startupList = db.collection("startup_data")
        const applications = db.collection("application")
        // get routes 
        app.get("/", async (req, res) => {
            const startup_data = await startupList.find({}).toArray();
            console.log(startup_data);

            res.send(startup_data)
        })
        app.post("/createStartup", async (req, res) => {
            const body = req.body;
            const createStartup = await startupList.insertOne(body)

            console.log(body);
            console.log(createStartup);
            res.send(createStartup)

        })
        // app.get("/getOpportunities", async (req, res)=>{
        //     const opportunitiesList =  opportunities.find({});
        //     const cursor = await opportunitiesList.toArray();
        //     res.send(cursor)
        // })
        app.get("/getStartup", async (req, res) => {
            const startup = await startupList.find().toArray();
            const opportunitiesList = await opportunities.find().toArray();
            startup.filter(stList => {
                opportunitiesList.filter((opList => {
                    const result = stList.userId === opList.userId
                    if (result) {
                        res.send({ stList, opList: [opList] })
                    }
                }))
            })
        })
        app.get("/getOpportunities", async (req, res) => {
            const startup = await startupList.find().toArray();
            const opportunitiesList = await opportunities.find().toArray();
            startup.filter(stList => {
                opportunitiesList.filter((opList => {
                    const result = stList.userId === opList.userId
                    if (result) {
                        res.send([{
                            id: stList._id,
                            startup_name: stList.startup_name,
                            industries: stList.industries,
                            opportunity: opportunitiesList
                        }])
                    }
                }))
            })
        })
        app.get("/getSingelOpportunity/:id", async (req, res) => {
            const id = req.params.id;
            const startup = await startupList.find().toArray();
            const opportunitiesList = await opportunities.find().toArray();
            const query = { _id: new ObjectId(id) }
            const singleData = await opportunities.findOne(query);
            const updateViews = opportunities.updateOne(query, {
                $inc: {
                    views: 1
                }
            })
            startup.filter(data => {
                if (data.userId === singleData.userId) {
                    console.log({ startup_name: data.startup_name, ...singleData });

                    res.send({
                        pitch: data.pitch,
                        team_size: data.team_size,
                        startup_address: data.startup_address,
                        startup_name: data.startup_name,
                        ...singleData
                    })

                }
            })
        })
        app.get("/applicationList", async (req, res) => {
            const applicationList = await applications.find().toArray();
            console.log(applicationList);

            res.send(applicationList)
        })
        // post routes 

        app.post("/createOpportunities", async (req, res) => {
            const body = req.body;
            const createOpportunities = await opportunities.insertOne({ views: 0, ...body })
            console.log(createOpportunities);

            res.send(createOpportunities)
        })
        app.post("/submitApplication", async (req, res) => {
            const body = req.body;

            const submitApplication = await applications.insertOne({ ...body, status: "applied" })
            console.log(submitApplication);
            console.log(body);

            if (submitApplication.acknowledged) {

                res.send(submitApplication)
            }

        })

        // delete routes
        app.delete("/deleteOpportunities/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const action = await opportunities.deleteOne(query);
            console.log(id);

            if (action.acknowledged) {
                res.send(action)
            }

        })
    } catch (error) {
        console.error("Failed to start backend:", error);
        process.exit(1);
    }
}

run();

process.on("SIGINT", async () => {
    await client.close();
    process.exit(0);
});
app.listen(4400, (server) => {
    console.log(server);

})