import path from "path";

import { getUserEmailList } from "./csv.js";
import { getNameTagInfo } from "./slack.js";
import { createPDF } from "./pdf.js";

const __dirname = path.resolve();

const TITLE_FIELD = "Xf023PKJBJ5D";
const HERD_FIELD = "XfGRTTEU1M";
const PRONOUN_FIELD = "XfRKMG1UDT";
const TEAM_FIELD = "XfGQ3TAKEU";
const IMAGE_SIZE = 192;
const SLACK_ICON = `${__dirname}/dist/images/slack_icon.png`;

(async () => {
  const emails = await getUserEmailList("./users.txt");

  const tags = await getNameTagInfo(emails, {
    keys: {
      title: TITLE_FIELD,
      herd: HERD_FIELD,
      teams: TEAM_FIELD,
    },
    pronounsKey: PRONOUN_FIELD,
    imageSize: IMAGE_SIZE,
  });

  await createPDF(tags, `${__dirname}/users.pdf`, SLACK_ICON, {
    templateName: "avery5395",
    textPadding: 5,
    baseFontSize: 10,
    regularFont: "./fonts/Montserrat-Regular.ttf",
    boldFont: "./fonts/Montserrat-Bold.ttf",
    altFont: "./fonts/MontserratAlternates-Bold.ttf",
    italicFont: "./fonts/Montserrat-Italic.ttf",
  });
})();
