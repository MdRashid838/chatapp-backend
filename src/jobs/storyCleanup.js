const cron = require("node-cron");
const Story = require("../models/Story");

cron.schedule("0 * * * *", async () => {

  await Story.deleteMany({
    expiresAt: { $lt: new Date() }
  });

  console.log("Expired stories deleted");

});