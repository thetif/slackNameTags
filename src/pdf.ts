// based on https://github.com/adlr/cards/blob/master/labels.js

import PDFDocument from "pdfkit";
import { createWriteStream } from "fs";

import { NameTagInfo, PDFConfigs } from "name-tag";

/**
 * Calculates the font size needed for the text to fit on one line in the available space.
 * If the font size needed to fit on one line in the available space is greater than 90%
 * of the ideal size, return the needed size, otherwise the ideal size is returned.
 * @param doc The PDF document
 * @param text The text being added
 * @param font The font being used
 * @param idealSize The ideal font size for the text
 * @param width The width available
 * @returns The ideal size unless shrinking the text by less than 90% would make it fit in the space
 */
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
  // if the needed size is greater than 90% of the ideal size, return the needed size
  if (idealSize * 0.9 < neededSize && neededSize < idealSize) return neededSize;
  // otherwise, return the idealSize and the text will wrap
  return idealSize;
}

/**
 *
 * @param tags The array of name tag information to add to the PDF
 * @param pdfName The output file name of the new PDF
 * @param PDFConfigs The configuration for the PDF
 *  {
 *    template: template for the PDF to follow,
 *    textPadding: padding around the text,
 *    baseFontSize: standard font size,
 *    regularFont: standard font type,
 *    boldFont: bold font type,
 *    altFont: alternate font type (will use regularFont, if not supplied)
 *    italicFont: italic font type (will use regularFont, if not supplied)
 *  }
 * @param watermark A watermark to add to the images, if desired
 */
export async function createPDF(
  tags: NameTagInfo[],
  pdfName: string,
  {
    template,
    textPadding,
    baseFontSize,
    regularFont,
    boldFont,
    altFont = regularFont,
    italicFont = regularFont,
  }: PDFConfigs,
  watermark: string
) {
  if (tags.length > 0 && template) {
    // Get the formatting for the PDF
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

    // create PDF file
    const doc = new PDFDocument();
    doc.pipe(createWriteStream(pdfName)); // write to PDF

    // Add each tag to the PDF
    tags.map((tag, i) => {
      if (i != 0 && i % (COLS * ROWS) == 0) {
        // Add a new page
        doc.addPage();
      }

      // Calculate the row and column of the tag
      const row = ((i / COLS) | 0) % ROWS;
      const col = i % COLS;
      const {
        avatar,
        name,
        username,
        optionalFields: { pronouns, ...optionalFields } = {},
      } = tag;

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

      if (watermark && watermark !== "") {
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
      const nameFontSize = getFontSizeToFit(
        doc,
        name,
        boldFont,
        baseFontSize * 1.5,
        textWidth
      );
      doc
        .font(boldFont)
        .fontSize(nameFontSize)
        .fillColor("#5c3977")
        .text(name, left, top, {
          ...textOptions,
          height: LABEL_HEIGHT - (top - BASE_TOP) - PADDING,
        });
      top +=
        textPadding +
        doc
          .font(boldFont)
          .fontSize(nameFontSize)
          .heightOfString(name, { width: textWidth });

      // Add username
      const usernameFontSize = getFontSizeToFit(
        doc,
        username,
        altFont,
        baseFontSize * 1.2,
        textWidth
      );
      doc
        .font(altFont)
        .fontSize(usernameFontSize)
        .fillColor("#ee5340")
        .text(username, left, top, {
          ...textOptions,
          height: LABEL_HEIGHT - (top - BASE_TOP) - PADDING,
        });
      top +=
        textPadding +
        doc
          .font(altFont)
          .fontSize(usernameFontSize)
          .heightOfString(username, { width: textWidth }); // move top down half a line plus the line height

      // Add pronouns, if supplied
      if (pronouns && pronouns !== "" && pronouns.match(/[\w|\d]+/g)) {
        const fontSize = getFontSizeToFit(
          doc,
          pronouns,
          italicFont,
          baseFontSize,
          textWidth
        );
        doc
          .font(italicFont)
          .fontSize(fontSize)
          .fillColor("#000")
          .text(pronouns, left, top, {
            ...textOptions,
            height: LABEL_HEIGHT - (top - BASE_TOP) - PADDING,
          });
        top +=
          textPadding +
          doc
            .font(italicFont)
            .fontSize(fontSize)
            .heightOfString(pronouns, { width: textWidth }); // move top down half a line plus the line height
      }

      // Add optional fields
      if (optionalFields) {
        for (const [key, text] of Object.entries(optionalFields)) {
          // only add the optional fields if they have values
          if (text && text !== "" && text.match(/[\w|\d]+/g)) {
            const fontSize = getFontSizeToFit(
              doc,
              text,
              regularFont,
              baseFontSize,
              textWidth
            );
            const lineHeight = doc
              .font(regularFont)
              .fontSize(fontSize)
              .heightOfString(text, { width: textWidth });
            const heightLeft = LABEL_HEIGHT - (top - BASE_TOP) - PADDING;
            if (lineHeight < heightLeft) {
              doc
                .font(regularFont)
                .fontSize(fontSize)
                .fillColor("#000")
                .text(text, left, top, {
                  ...textOptions,
                  height: heightLeft,
                });
              top += textPadding + lineHeight; // move top down half a line plus the line height
            }
          }
        }
      }
    });

    // finalize the PDF and end the stream
    doc.end();
  }
}
