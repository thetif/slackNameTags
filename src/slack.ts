import { WebClient, UsersProfileGetResponse } from "@slack/web-api";
import { promises as fs } from "fs";
import * as path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

import { NameTagInfo, SlackConfigs } from "name-tag";

const currentDirectory = path.resolve();
const web = new WebClient(process.env.SLACK_USER_TOKEN);
const DEFAULT_IMAGE_SIZE = 192;

type SlackProfile = {
  real_name_normalized: string;
  display_name_normalized: string;
  optionalFields?: { pronouns: string; [key: string]: string };
  imageUrl: string;
};

/**
 * Finds the filename in the url
 * @param url The url of the image to get the filename from
 * @returns The filename from the url or a random uuid
 */
export function getFilenameByUrl(url: string): [string, string] {
  const urlParts = decodeURI(url) // remove any URI encoding
    ?.split("?")?.[0] // remove any parameters
    ?.replace(/http(s)?:\/\//, "")
    ?.split("/"); // split the url on slashes
  if (urlParts.length > 1) {
    // get the last part of the url
    const fullFilename = urlParts?.pop();
    // check that it is an image name
    if (fullFilename?.match(/(\.(jpe?g|png|gif|bmp))$/)) {
      // split the filename apart
      const fileParts = fullFilename?.split(".");
      // get the first part as the filename
      const filename = fileParts?.[0] || uuidv4(); // default to random value
      // get the last part as the extension
      const extension = fileParts?.pop() || "";
      return [filename, extension];
    }
  }

  return [uuidv4(), ""];
}

/**
 * Fetches the image and returns it as a Buffer
 * @param url The url of the image to download
 * @returns The Buffer of the downloaded image
 */
export async function getImageBuffer(url: string): Promise<Buffer | null> {
  try {
    // fetch the image and follow a redirect, if necessary
    const response = await fetch(url, { redirect: "follow" });
    // if the response is successful, return the image as a Buffer
    if (response.status >= 200 && response.status < 300) {
      // Get the blob from the response
      const blob = await response?.blob();
      // Get the array buffer from the blob
      const arrayBuffer = await blob?.arrayBuffer();
      if (arrayBuffer) {
        // return the array buffer as a Buffer
        return Buffer.from(arrayBuffer);
      }
    }
  } catch (error) {
    console.error(`Error fetching the file: ${JSON.stringify(error)}`);
  }
  return null;
}

/**
 * Converts the image buffer to a png, resizes the image, lightens them slightly,
 * and rounds the corners
 * @param buffer The Buffer of the downloaded image
 * @param filename The filename of the file that will be written
 * @param imageSize The desired size of the image
 * @returns The newly converted Buffer or the original buffer
 */
export async function convertImage(
  buffer: Buffer,
  filename: string,
  imageSize: number
): Promise<Buffer | null> {
  const roundSize = imageSize * 0.25;
  // Buffer of rounded corners of the size of the image
  const roundedCorners = Buffer.from(
    `<svg><rect x="0" y="0" width="${imageSize}" height="${imageSize}" rx="${roundSize}" ry="${roundSize}"/></svg>`
  );

  try {
    // use sharp to resize the image, round the corners, and convert to png
    return (
      sharp(buffer)
        .resize(imageSize, imageSize) // resize image to desired size, slack uses square images
        .composite([{ input: roundedCorners, blend: "dest-in" }]) // round the corners
        .modulate({ brightness: 1.1, saturation: 0.9 }) // lighten the image slightly to account for printing
        .png() // convert to png, must be a png to have rounded corners
        .toBuffer() ?? null
    ); // if sharp can't convert the image, then use the original buffer
  } catch (error) {
    console.error(
      `Error editing the image file ${filename}: ${JSON.stringify(error)}`
    );
    return buffer; // if there was an error use the original buffer
  }
}

/**
 * Saves the image to the local directory
 * @param filename The filename of the image
 * @param buffer The Buffer of the image
 * @param extension The extension of the image
 * @returns The filepath of the saved image
 */
export async function writeImage(
  filename: string,
  buffer: Buffer,
  extension: string = "png"
): Promise<string> {
  const filepath = `${currentDirectory}/dist/images/${filename}.${extension}`;
  try {
    // write the buffer to the local file
    await fs.writeFile(filepath, buffer);
    return filepath;
  } catch (error) {
    console.error(
      `Error writing the image file ${filename}: ${JSON.stringify(error)}`
    );
    return "";
  }
}

/**
 * Downloads an image, converts it to png, resizes it, and rounds the edges
 * @param url The url of the image
 * @param imageSize The desired size of the downloaded image
 * @returns the file path to the downloaded image
 */
export async function downloadImage(
  url: string,
  imageSize: number = DEFAULT_IMAGE_SIZE // use the default size if not specified
): Promise<string> {
  // get the filename and extension from the url
  const [filename, extension] = getFilenameByUrl(url);

  if (filename) {
    // if the filename was found, download the image
    const buffer = await getImageBuffer(url);

    if (buffer) {
      // if the image was downloaded, convert it to png, resize it, and round the corners
      const roundedBuffer = await convertImage(buffer, filename, imageSize);
      if (roundedBuffer) {
        // if the image was converted, save it to the local directory
        return writeImage(filename, roundedBuffer, "png");
      }
      // if the image was downloaded, but not converted, save it to the local directory
      return writeImage(filename, buffer, extension);
    }
  }

  console.error(`Could not retrieve filename for: ${url}`);
  return "";
}

/**
 * Takes in a name string and checks for pronouns being in the name.
 * If there are pronouns in the name, remove them and return the name
 * stripped of everything else and also return the pronouns if found.
 * @param name The name to normalize
 * @returns [string, string] The normalized name and the pronouns found
 */
export function normalizeName(name: string | null): [string, string] {
  const normalizedName = name?.trim() || "";
  let pronouns = "";

  // check to see if there are parenthesis
  if (normalizedName.match(/\((.*?)\)/)) {
    // get the index of the open parenthesis
    const startIndex = normalizedName.indexOf("(");

    // if the name has pronouns in it get it
    if (normalizedName.match(/\(\w+\/\w+\)/)) {
      // get the index of the close parenthesis
      const endIndex = normalizedName.indexOf(")");

      // starting the substring right after the open parenthesis
      pronouns = normalizedName.substring(startIndex + 1, endIndex)?.trim();
    }

    // the actual name should be the part before the open parenthesis
    return [normalizedName.substring(0, startIndex)?.trim(), pronouns];
  }

  return [normalizedName, pronouns];
}

/**
 * Finds the user id by their email address. If the user is not found
 * by the given email address, it will try replacing the domain
 * from fearless.tech to fearsol.com or vice versa.
 * @param email The email address of the user to find
 * @returns The user id of the user
 */
export async function lookupUserIdByEmail(
  email: string
): Promise<string | null> {
  const normalizedEmail = email?.trim();
  let user;
  try {
    // Look for the user by their email
    user = await web.users.lookupByEmail({
      email: normalizedEmail,
    });
  } catch (error) {
    try {
      if (normalizedEmail?.match("@fearsol.com")) {
        // if the user wasn't found and they have a fearsol.com email
        // try switching it with fearless.tech and looking for them again
        user = await web.users.lookupByEmail({
          email: normalizedEmail?.replace("@fearsol.com", "@fearless.tech"),
        });
      } else if (normalizedEmail?.match("@fearless.tech")) {
        // if the user wasn't found and they have a fearless.tech email
        // try switching it with fearsol.com and looking for them again
        user = await web.users.lookupByEmail({
          email: normalizedEmail?.replace("@fearless.tech", "@fearsol.com"),
        });
      } else {
        // if the user wasn't found and they do not have a fearless
        // email address, then they can't be found
        console.error(`${email}: ${user?.error}`);
        user = null;
      }
    } catch (err) {
      console.error(`${email}: ${user?.err}`);
      user = null;
    }
  }

  return user?.user?.id || null;
}

/**
 * Gets the correct image url from the user's profile based
 * on the desired size
 * @param profile The user's profile from slack
 * @param imageSize The desired size of the image
 * @returns The image url, if one exists in that size otherwise
 * it returns the image url of the default size
 */
export function getImageUrl(
  profile: UsersProfileGetResponse,
  imageSize: number
): string {
  switch (imageSize) {
    case 24:
      return profile?.profile?.image_24 || "";
    case 32:
      return profile?.profile?.image_32 || "";
    case 48:
      return profile?.profile?.image_48 || "";
    case 72:
      return profile?.profile?.image_72 || "";
    case 192:
      return profile?.profile?.image_192 || "";
    case 512:
      return profile?.profile?.image_512 || "";
    case 1024:
      return profile?.profile?.image_1024 || "";
    default:
      return profile?.profile?.[`image_${DEFAULT_IMAGE_SIZE}`] || "";
  }
}

/**
 * Retrieves the user's profile from Slack
 * @param userId The id of the user
 * @param configs The specific
 * @returns The profile for the user
 */
export async function getUserProfile(
  userId: string,
  { keys, imageSize }: SlackConfigs
): Promise<SlackProfile | null> {
  try {
    // if the user was found and they have an id, retrieve their profile
    const profile = await web.users.profile.get({
      user: userId,
    });

    if (profile?.ok && profile?.profile) {
      // if the profile was found and has values, use it to create the NameTagInfo and return it
      const {
        real_name_normalized = "",
        display_name_normalized = "",
        fields = {},
      } = profile.profile;

      // Process the optional fields, saving the values for the
      // keys that were passed in
      const optionalFields: { [key: string]: string } = {};
      if (fields) {
        for (const [key, value] of Object.entries(keys)) {
          optionalFields[key] = fields?.[value]?.value?.trim() || "";
        }
      }

      // Pull pronouns out of optionalFields, because TypeScript expects it to be named
      const { pronouns = "", ...otherFields } = optionalFields;

      // return the profile information in the expected format
      return {
        real_name_normalized: real_name_normalized,
        display_name_normalized: display_name_normalized,
        imageUrl: getImageUrl(profile, imageSize),
        optionalFields: {
          pronouns: pronouns?.trim(),
          ...otherFields,
        },
      };
    }
    return null;
  } catch (error) {
    console.error(`${userId}: ${error}`);
    return null;
  }
}

/**
 * Retrieves the user's information from Slack
 * @param {string} email The email address to look up
 * @param {SlackConfigs} configs The specific configurations for retrieving the user's information
 * @returns {Promise<NameTagInfo | null>} The user's information in NameTagInfo format
 */
export async function getUserInfo(
  email: string,
  configs: SlackConfigs
): Promise<NameTagInfo | null> {
  // Look up the userId by using the given email address
  const userId = await lookupUserIdByEmail(email?.trim());

  if (userId) {
    // Get the user's profile from their user id
    const profileInfo = await getUserProfile(userId, configs);
    if (profileInfo) {
      // if the profile was found and has values, use it to create the NameTagInfo and return it
      const {
        real_name_normalized,
        display_name_normalized,
        imageUrl,
        optionalFields: { pronouns = "", ...optionalFields } = {},
      } = profileInfo;

      // Normalize the name (remove text that isn't the name)
      // get pronouns from the name if available
      const [normalizedName, namePronouns] =
        normalizeName(real_name_normalized);

      // Normalize the username (remove text that isn't the username)
      // get pronouns from the name if available
      const [normalizedUsername, usernamePronouns] = normalizeName(
        display_name_normalized
      );

      // Just in case the user hasn't created a username, default to their display name
      const username = normalizedUsername || normalizedName;

      // derive the pronouns from all of the places they might be set
      // the pronouns field, the name, or the username
      let derivedPronouns = pronouns || namePronouns || usernamePronouns || "";
      if (derivedPronouns) {
        // remove paranthesis from the pronouns
        const terms = derivedPronouns
          .replace("(", "")
          .replace(")", "")
          .split("/");
        derivedPronouns = terms
          ?.map((term) => term?.toLowerCase())
          ?.join("/")
          ?.trim();
      }

      // download the image to the local drive and get the path to it
      const imageSize = configs.imageSize;
      const avatar = imageUrl ? await downloadImage(imageUrl, imageSize) : "";

      const tag: NameTagInfo = {
        name: normalizedName,
        username: username ? `@${username}` : "",
        avatar,
        optionalFields: {
          pronouns: derivedPronouns,
          ...optionalFields,
        },
      };

      return tag;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

/**
 * Retrieve the NameTagInfo for users in the file
 * @param filename The name of the file to retrieve users from
 * @param configs The specific configurations for retrieving the user's information
 * @returns {Promise<NameTagInfo[]>} The array of NameTagInfo from the users in the file
 */
export async function getNameTagInfo(
  emails: string[],
  configs: SlackConfigs
): Promise<NameTagInfo[]> {
  const tags: NameTagInfo[] = [];

  // retrieve user info from each email
  const results = await Promise.allSettled(
    emails.map((email) => {
      try {
        return getUserInfo(email, configs);
      } catch (error) {
        return null;
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
