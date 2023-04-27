import { createReadStream } from "fs";
import { parse } from "csv-parse";
import http from "http";
import https from "https";

/**
 * Open file of users and return a list of email addresses
 * @param {string} filename The name of the file holding the user emails
 * @return {Promise<string[]>} The list of emails from the file
 */
export async function getUserEmailList(filename: string): Promise<string[]> {
  const users: string[] = [];
  let index = -1;

  return new Promise(function (resolve, reject) {
    createReadStream(filename)
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row: string[]) {
        if (index === -1) {
          // find the index of the column with the email addresses
          index = row.findIndex((element: string) => element.match(/@fear*/));
        }

        // Slack expects the email to end in fearless.tech not fearsol.com so replace it
        const email =
          row[index]?.replace("@fearsol.com", "@fearless.tech") ?? "";
        // add emails to list only if they end in @fearless.tech, ignore none Fearless users
        if (email.match(/@fearless.tech/)) {
          users.push(email);
        }
      })
      .on("end", function () {
        resolve(users);
      })
      .on("error", function (error) {
        reject(error);
      });
  });
}
