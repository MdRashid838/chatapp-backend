const {createClient} = require("redis");

const pubClient = createClient({url: "redis://localhost:6379"});
const subClient = pubClient.dublicate();

pubClient.connect();
subClient.connect();

module.exports = {pubClient, subClient};