import { WebClient } from "@slack/web-api";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

import { NameTagInfo } from "name-tag";

const __dirname = path.resolve();

const token = process.env.SLACK_USER_TOKEN;
const signingSecret = process.env.SLACK_SIGNING_SECRET;

const web = new WebClient(token);

const HERD_FIELD = "XfGRTTEU1M";
const PRONOUN_FIELD = "XfRKMG1UDT";
const TEAM_FIELD = "XfGQ3TAKEU";
const IMAGE_SIZE = 192;

async function downloadImage(url: string): Promise<string> {
  const filename = decodeURI(url) // remove any URI encoding
    ?.split("?")?.[0] // remove any parameters
    ?.split("/") // split the url on slashes
    ?.pop() // get the last element
    ?.split(".")?.[0]; // remove the extension

  if (filename) {
    const filepath = `${__dirname}/dist/images/${filename}.png`;
    let response;
    try {
      response = await fetch(url);
    } catch (error) {
      console.error(`Error fetching the file: ${JSON.stringify(error)}`);
      return "";
    }
    const blob = await response?.blob();
    const arrayBuffer = await blob?.arrayBuffer();
    if (arrayBuffer) {
      const buffer = Buffer.from(arrayBuffer);
      let roundedBuffer: Buffer;
      try {
        const roundedCorners = Buffer.from(
          `<svg><rect x="0" y="0" width="${IMAGE_SIZE}" height="${IMAGE_SIZE}" rx="50" ry="50"/></svg>`
        );

        roundedBuffer =
          (await sharp(buffer)
            .resize(IMAGE_SIZE, IMAGE_SIZE)
            .composite([
              {
                input: roundedCorners,
                blend: "dest-in",
              },
            ])
            .png()
            .toBuffer()) ?? buffer;
      } catch (error) {
        roundedBuffer = buffer;
        console.error(
          `Error editing the image file ${filename}: ${JSON.stringify(error)}`
        );
      }

      try {
        await fs.writeFile(filepath, roundedBuffer);
      } catch (error) {
        console.error(
          `Error writing the image file ${filename}: ${JSON.stringify(error)}`
        );
        return "";
      }
      return filepath;
    }
  }
  console.error(`Could not retrieve filename for: ${url}`);
  return "";
}

/**
 * Retrieves the user's information from Slack
 * @param {string} email The email address to look up
 * @returns {Promise<NameTagInfo | null>} The user's information in NameTagInfo format
 */
export async function getUserInfo(email: string): Promise<NameTagInfo | null> {
  // retrieve the user by email address
  const user = await web.users.lookupByEmail({
    email,
  });

  if (user.ok && user?.user?.id) {
    // if the user was found and they have an id, retrieve their profile
    const profile = await web.users.profile.get({
      user: user.user.id,
    });

    if (profile.ok && profile?.profile) {
      // if the profile was found and has values, use it to create the NameTagInfo and return it
      const { title, real_name_normalized, display_name_normalized, fields } =
        profile.profile;

      // retrieve the avatar url for the size we want
      const image: string | undefined =
        profile?.profile?.[`image_${IMAGE_SIZE}`];

      // clean up the username to remove pronouns, save the pronouns
      // just in case they aren't set in the pronouns field
      let username: string = "";
      let username_pronouns: string = "";
      if (display_name_normalized) {
        const index = display_name_normalized.match(/(\w+\/\w+)/)?.index;
        if (index) {
          username_pronouns = display_name_normalized
            .substring(index) // starting the substring from the index of pronouns
            ?.trim() // trim white space
            ?.replace("(", "") // remove parens
            ?.replace(")", ""); // remove parens
        }

        username = `@${display_name_normalized?.split(" ")?.[0]}`;
      }

      // download the image to the local drive and get the new path to it
      const avatar = image ? await downloadImage(image) : "";

      const tag: NameTagInfo = {
        name: real_name_normalized ?? "",
        username,
        avatar,
        title: title ?? "",
        herd: fields?.[HERD_FIELD]?.value ?? "",
        pronouns: fields?.[PRONOUN_FIELD]?.value ?? username_pronouns,
        teams: fields?.[TEAM_FIELD]?.value ?? "",
      };

      return tag;
    } else {
      console.error(`${email}: ${profile?.error}`);
      return null;
    }
  } else {
    console.error(`${email}: ${user?.error}`);
    return null;
  }
}

/**
 * Retrieve the NameTagInfo for users in the file
 * @param filename The name of the file to retrieve users from
 * @returns {Promise<NameTagInfo[]>} The array of NameTagInfo from the users in the file
 */
export async function getNameTagInfo(emails: string[]): Promise<NameTagInfo[]> {
  const tags: NameTagInfo[] = [];

  const errorEmails = [];
  // retrieve user info from each email
  const results = await Promise.allSettled(
    emails.map((email) => {
      try {
        return getUserInfo(email);
      } catch (error) {
        errorEmails.push({ email, error });
      }
    })
  );

  // filter out results that weren't successful
  results.forEach((result) => {
    if (result?.status === "fulfilled" && result?.value) {
      tags.push(result.value);
    } else if (result?.status === "rejected") {
      console.error(
        `status: ${result?.status}, reason: ${JSON.stringify(
          result?.reason,
          null,
          2
        )}`
      );
    }
  });

  return tags;
}
