import path from "path";
import { getUserEmailList } from "./csv.js";
import { getNameTagInfo } from "./slack.js";
import { createPDF } from "./pdf.js";
import { avery5395 } from "./templates.js";

import { SlackConfigs, PDFConfigs } from "name-tag";

type AppConfigs = {
  inputFile: string;
  outputFile: string;
  slackConfigs: SlackConfigs;
  imageWatermark: string;
  pdfConfigs: PDFConfigs;
  bigShotsWhoDoNotRSVP?: string[];
};

/**
 * Creates the PDF of name tags based on the emails passed in
 */
async function generatePDF({
  inputFile,
  outputFile,
  slackConfigs,
  imageWatermark,
  pdfConfigs,
  bigShotsWhoDoNotRSVP = [],
}: AppConfigs) {
  if (inputFile && outputFile && slackConfigs && pdfConfigs) {
    // Get the emails from the csv/text file
    const emails = await getUserEmailList(inputFile);
    // Use the emails to get the information from Slack
    const tags = await getNameTagInfo(
      [...new Set([...bigShotsWhoDoNotRSVP, ...emails])].sort(),
      slackConfigs
    );
    // Use the information to create the PDF
    await createPDF(tags, outputFile, pdfConfigs, imageWatermark);
  }
}

// Run the program
(async () => {
  const __dirname = path.resolve();

  const inputFile = "./users.txt";
  const outputFile = `${__dirname}/users.pdf`;
  const slackConfigs: SlackConfigs = {
    keys: {
      pronouns: "XfRKMG1UDT",
      title: "Xf023PKJBJ5D",
      herd: "XfGRTTEU1M",
      teams: "XfGQ3TAKEU",
    },
    imageSize: 192,
  };
  const imageWatermark = `${__dirname}/dist/images/slack_icon.png`;
  const pdfConfigs: PDFConfigs = {
    template: avery5395,
    textPadding: 5,
    baseFontSize: 10,
    regularFont: "./fonts/Montserrat-Regular.ttf",
    boldFont: "./fonts/Montserrat-Bold.ttf",
    altFont: "./fonts/MontserratAlternates-Bold.ttf",
    italicFont: "./fonts/Montserrat-Italic.ttf",
  };

  const bigShotsWhoDoNotRSVP = [
    "ddzirasa@fearless.tech",
    "jfoster@fearless.tech",
    "sbaggage@fearless.tech",
  ];

  await generatePDF({
    inputFile,
    outputFile,
    slackConfigs,
    pdfConfigs,
    imageWatermark,
    bigShotsWhoDoNotRSVP,
  });
})();
