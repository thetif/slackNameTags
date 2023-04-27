import { getUserEmailList } from "./csv.js";
import { getNameTagInfo } from "./slack.js";
import { createPDF } from "./pdf.js";
import { PDFConfigs } from "name-tag";

(async () => {
  const emails = await getUserEmailList("./users.txt");
  const tags = await getNameTagInfo(emails);
  const configs: PDFConfigs = {
    templateName: "avery5395",
    regularFont: "./fonts/Montserrat-Regular.ttf",
    boldFont: "./fonts/Montserrat-Bold.ttf",
    altFont: "./fonts/MontserratAlternates-Bold.ttf",
    italicFont: "./fonts/Montserrat-Italic.ttf",
  };
  await createPDF(tags, configs);
})();
