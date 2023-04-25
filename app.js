const { App } = require("@slack/bolt");
const { WebClient } = require("@slack/web-api");
const fs = require("fs");

const token = process.env.SLACK_USER_TOKEN;
const signingSecret = process.env.SLACK_SIGNING_SECRET;

const web = new WebClient(token);

(async () => {
  const user = await web.users.lookupByEmail({
    email: "tforkner@fearless.tech",
  });
  console.log({ user });
})();
