import PDFDocument from "pdfkit";
import { createWriteStream } from "fs";

import { NameTagInfo, PDFConfigs } from "name-tag";
import { getTemplateByName } from "./constants.js";

function getFontSizeToFit(
  doc: PDFKit.PDFDocument,
  text: string,
  font: string,
  idealSize: number,
  width: number
) {
  doc.font(font).fontSize(idealSize);
  const realWidth = doc.widthOfString(text);
  const neededSize = (idealSize * width) / realWidth;
  if (idealSize * 0.9 < neededSize && neededSize < idealSize) return neededSize;
  return idealSize;
}

export async function createPDF(
  tags: NameTagInfo[],
  pdfName: string,
  watermark: string,
  {
    templateName,
    textPadding,
    baseFontSize,
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
      ROUNDED,
      PADDING,
      SHOW_OUTLINE,
    } = template;

    // create PDF
    const doc = new PDFDocument();
    doc.pipe(createWriteStream(pdfName)); // write to PDF

    tags.map((tag, i) => {
      if (i != 0 && i % (COLS * ROWS) == 0) {
        // Add a new page
        doc.addPage();
      }

      const row = ((i / COLS) | 0) % ROWS;
      const col = i % COLS;
      const { avatar, name, username, pronouns, optionalFields } = tag;

      const BASE_LEFT = LEFT_MARGIN + X_STRIDE * col;
      const BASE_TOP = TOP_MARGIN + Y_STRIDE * row;
      let left = BASE_LEFT; // set initial left value to where the label starts
      let top = BASE_TOP; // set initial top value to where the label starts

      // Draw label rectangle
      if (SHOW_OUTLINE) {
        doc.lineWidth(1).strokeColor("#ccc");
        doc.roundedRect(left, top, LABEL_WIDTH, LABEL_HEIGHT, ROUNDED).stroke();
      }

      // add padding before adding anything to tag
      left += PADDING; // add a little padding to the left
      top += PADDING; // add a little padding to the top

      // Add avatar image to the tag
      // set image to 1/3 label width minus padding on either side
      const imageSize = (LABEL_WIDTH - PADDING - PADDING) / 3;
      if (avatar) {
        doc.image(avatar, left, top, {
          fit: [imageSize, imageSize], // slack uses square images
        });
      }

      if (watermark) {
        // Add watermark to avatar
        doc.image(
          watermark,
          left + imageSize - imageSize / 5,
          top + imageSize - imageSize / 5,
          {
            fit: [imageSize / 3, imageSize / 3],
          }
        );
      }

      // Add text
      // text width should be the width of the label minus image width and padding
      const textWidth = LABEL_WIDTH - PADDING - PADDING - imageSize - PADDING;
      const textOptions = {
        align: "left",
        width: textWidth,
      };
      left += imageSize + PADDING; // set left to the right of the image with padding

      // Add name
      doc
        .font(boldFont)
        .fontSize(
          getFontSizeToFit(doc, name, boldFont, baseFontSize * 1.5, textWidth)
        )
        .fillColor("#5c3977")
        .text(name, left, top, {
          ...textOptions,
          height: LABEL_HEIGHT - (top - BASE_TOP) - PADDING,
        });
      top += textPadding + doc.heightOfString(name, { width: textWidth });

      // Add username
      doc
        .font(altFont)
        .fontSize(
          getFontSizeToFit(
            doc,
            username,
            altFont,
            baseFontSize * 1.2,
            textWidth
          )
        )
        .fillColor("#ee5340")
        .text(username, left, top, {
          ...textOptions,
          height: LABEL_HEIGHT - (top - BASE_TOP) - PADDING,
        });
      top += textPadding + doc.heightOfString(username, { width: textWidth }); // move top down half a line plus the line height

      // Add pronouns
      if (pronouns) {
        doc
          .font(italicFont)
          .fontSize(
            getFontSizeToFit(doc, pronouns, italicFont, baseFontSize, textWidth)
          )
          .fillColor("#000")
          .text(pronouns, left, top, {
            ...textOptions,
            height: LABEL_HEIGHT - (top - BASE_TOP) - PADDING,
          });
        top += textPadding + doc.heightOfString(pronouns, { width: textWidth }); // move top down half a line plus the line height
      }

      if (optionalFields) {
        for (const [key, text] of Object.entries(optionalFields)) {
          const lineHeight = doc.heightOfString(text, { width: textWidth });
          const heightLeft = LABEL_HEIGHT - (top - BASE_TOP) - PADDING;
          if (lineHeight < heightLeft) {
            doc
              .font(regularFont)
              .fontSize(
                getFontSizeToFit(
                  doc,
                  text,
                  regularFont,
                  baseFontSize,
                  textWidth
                )
              )
              .fillColor("#000")
              .text(text, left, top, {
                ...textOptions,
                height: heightLeft,
              });
            // .moveDown(0.5);
            top += textPadding + lineHeight; // move top down half a line plus the line height
          }
        }
      }
    });

    // finalize the PDF and end the stream
    doc.end();
  }
}
