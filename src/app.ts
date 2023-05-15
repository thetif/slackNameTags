import path from "path";

import { getUserEmailList } from "./csv.js";
import { getNameTagInfo } from "./slack.js";
import { createPDF } from "./pdf.js";
import { avery5395 } from "./templates.js";

const __dirname = path.resolve();

const SLACK_ICON = `${__dirname}/dist/images/slack_icon.png`;

async function generatePDF() {
  const emails = await getUserEmailList("./users.txt");

  const tags = await getNameTagInfo(emails, {
    keys: {
      pronouns: "XfRKMG1UDT",
      title: "Xf023PKJBJ5D",
      herd: "XfGRTTEU1M",
      teams: "XfGQ3TAKEU",
    },
    imageSize: 192,
  });

  await createPDF(tags, `${__dirname}/users.pdf`, SLACK_ICON, {
    template: avery5395,
    textPadding: 5,
    baseFontSize: 10,
    regularFont: "./fonts/Montserrat-Regular.ttf",
    boldFont: "./fonts/Montserrat-Bold.ttf",
    altFont: "./fonts/MontserratAlternates-Bold.ttf",
    italicFont: "./fonts/Montserrat-Italic.ttf",
  });
}

(async () => {
  await generatePDF();
})();
