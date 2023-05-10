import { createReadStream } from "fs";
import { parse } from "csv-parse";

/**
 * Open file of users and return a list of email addresses
 * @param {string} filename The name of the file holding the user emails
 * @return {Promise<string[]>} The list of emails from the file
 */
export async function getUserEmailList(filename: string): Promise<string[]> {
  const emails: string[] = [];
  let index = -1;

  return new Promise(function (resolve, reject) {
    createReadStream(filename)
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row: string[]) {
        if (index === -1) {
          // find the index of the column with the email addresses
          index = row.findIndex((element: string) =>
            element.match(/@.+\.(tech|com)/)
          );
        }

        emails.push(row[index]?.trim());
      })
      .on("end", function () {
        resolve(emails);
      })
      .on("error", function (error) {
        reject(error);
      });
  });
}
