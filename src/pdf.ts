import PDFDocument, { text } from "pdfkit";
import { createWriteStream } from "fs";
import path from "path";

import { NameTagInfo, PDFConfigs } from "name-tag";
import { getTemplateByName } from "./constants.js";

const __dirname = path.resolve();
const pdfConfigs = {};

const SLACK_ICON = `${__dirname}/dist/images/slack_icon.png`;

function getFontSizeToFit(
  doc: PDFKit.PDFDocument,
  text: string,
  font: string,
  idealSize: number,
  width: number
) {
  doc.font(font).fontSize(idealSize);
  const realWidth = doc.widthOfString(text);
  if (realWidth <= width) return idealSize;
  return (idealSize * width) / realWidth;
}

function getLineHeight(
  doc: PDFKit.PDFDocument,
  text: string,
  textWidth: number
): number {
  const width = doc.widthOfString(text);
  const lines = Math.ceil(width / textWidth);
  return doc.currentLineHeight() * lines;
}

export async function createPDF(
  tags: NameTagInfo[],
  {
    templateName,
    regularFont,
    boldFont,
    altFont = regularFont,
    italicFont = regularFont,
  }: PDFConfigs
) {
  const template = getTemplateByName(templateName);

  if (tags.length > 0 && template) {
    const {
      ROWS,
      COLS,
      LEFT_MARGIN,
      TOP_MARGIN,
      LABEL_WIDTH,
      LABEL_HEIGHT,
      X_STRIDE,
      Y_STRIDE,
      TOP_PAD,
      ROUNDED,
      PADDING,
      WASTE,
      SHOW_OUTLINE,
    } = template;

    // create PDF
    const doc = new PDFDocument(pdfConfigs);
    doc.pipe(createWriteStream(`${__dirname}/users.pdf`)); // write to PDF

    tags.map((tag, i) => {
      if (i != 0 && i % (COLS * ROWS) == 0) {
        // Add a new page
        doc.addPage();
      }

      const row = ((i / COLS) | 0) % ROWS;
      const col = i % COLS;
      const { avatar, name, username, pronouns, title, herd, teams } = tag;

      const BASE_LEFT = LEFT_MARGIN + X_STRIDE * col;
      const BASE_TOP = TOP_MARGIN + Y_STRIDE * row;
      let left = BASE_LEFT; // set initial left value to where the label starts
      let top = BASE_TOP; // set initial top value to where the label starts

      // Draw label rectangle
      if (SHOW_OUTLINE) {
        doc.lineWidth(1).strokeColor("#ccc");
        doc.roundedRect(left, top, LABEL_WIDTH, LABEL_HEIGHT, ROUNDED).stroke();
      }

      // Add avatar image to the tag
      left += PADDING; // add a little padding to the left of the image
      top += PADDING; // add a little padding to the top of the image
      const imageSize = LABEL_WIDTH / 3 - PADDING - PADDING; // set image to 1/3 label width minus padding
      doc.image(avatar, left, top, {
        fit: [imageSize, imageSize], // slack uses square images
      });
      doc.image(SLACK_ICON, left + imageSize - 10, top + imageSize - 10, {
        fit: [15, 15],
      });

      const textWidth = LABEL_WIDTH - imageSize - PADDING - PADDING; // text width should be the width of the label minus image width and padding

      const textOptions = {
        align: "left",
        width: textWidth,
      };
      left = BASE_LEFT + imageSize + PADDING + PADDING; // reset left to the right side of the image

      // Add name
      doc
        .font(boldFont)
        .fontSize(getFontSizeToFit(doc, name, boldFont, 12, textWidth))
        .fillColor("#5c3977")
        .text(name, left, top, {
          ...textOptions,
          height: LABEL_HEIGHT - (top - BASE_TOP),
        })
        .moveDown(0.25);
      // top += doc.currentLineHeight() + TOP_PAD; // set top to where the name ends

      // Add username
      doc
        .font(altFont)
        .fontSize(getFontSizeToFit(doc, username, altFont, 10, textWidth))
        .fillColor("#ee5340")
        .text(username, {
          ...textOptions,
          height: LABEL_HEIGHT - (top - BASE_TOP),
        })
        .moveDown(0.5);

      // Add pronouns
      if (pronouns) {
        doc
          .font(regularFont)
          .fontSize(10)
          .fillColor("#000")
          .text(pronouns, {
            ...textOptions,
            height: LABEL_HEIGHT - (top - BASE_TOP),
          })
          .moveDown(0.5);
      }

      // Add title
      if (title) {
        doc
          .font(regularFont)
          .fontSize(10)
          .fillColor("#000")
          .text(title, {
            ...textOptions,
            height: LABEL_HEIGHT - (top - BASE_TOP),
          })
          .moveDown(0.5);
      }

      // Add herd
      if (herd) {
        doc
          .font(regularFont)
          .fontSize(10)
          .fillColor("#000")
          .text(herd, {
            ...textOptions,
            height: LABEL_HEIGHT - (top - BASE_TOP),
          })
          .moveDown(0.5);
      }

      // Add teams
      if (teams) {
        doc
          .font(regularFont)
          .fontSize(10)
          .fillColor("#000")
          .text(teams, {
            ...textOptions,
            height: LABEL_HEIGHT - (top - BASE_TOP),
          });
      }
    });

    // finalize the PDF and end the stream
    doc.end();
  }
}
