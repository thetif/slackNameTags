import { rest, compose, context } from "msw";
import fs from "fs";
import path from "path";
import { UsersProfileGetResponse } from "@slack/web-api";
import { server } from "./mocks/server";
import {
  getFilenameByUrl,
  getImageBuffer,
  writeImage,
  downloadImage,
  normalizeName,
  lookupUserIdByEmail,
  getImageUrl,
  getUserProfile,
  getUserInfo,
  getNameTagInfo,
} from "./slack";
import {
  PRONOUN_FIELD,
  TITLE_FIELD,
  HERD_FIELD,
  TEAM_FIELD,
  QUOTE_FIELD,
  COI_FIELD,
  SlackProfile,
} from "./mocks/profile.data";

import { SlackConfigs } from "name-tag";

const currentDirectory = path.resolve();

describe("Slack", () => {
  describe("getFilenameByUrl", () => {
    it("should handle standard image url", () => {
      const [filename, extension] = getFilenameByUrl(
        "https://avatars.slack-edge.com/2023-05-08/d3b12a9c2b2c4536af8716efff9030fb.jpg"
      );
      expect(filename).toEqual("d3b12a9c2b2c4536af8716efff9030fb");
      expect(extension).toEqual("jpg");
    });

    it("should handle gravatar image url", () => {
      const [filename, extension] = getFilenameByUrl(
        "https://secure.gravatar.com/avatar/f6e56e92b0984949a3ceabd8f80bb8a7.jpg?s=24&d=https%3A%2F%2Fa.slack-edge.com%2Fdf10d%2Fimg%2Favatars%2Fava_0007-42.png"
      );
      expect(filename).toEqual("f6e56e92b0984949a3ceabd8f80bb8a7");
      expect(extension).toEqual("jpg");
    });

    it("should handle a bad url", () => {
      const [filename, extension] = getFilenameByUrl(
        "https://avatars.slack-edge.com/"
      );
      expect(filename).toMatch(
        /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
      );
      expect(extension).toEqual("");
    });
  });

  describe("getImageBuffer", () => {
    it("should fetch the image by the url", async () => {
      const expected = fs.readFileSync(
        path.resolve(__dirname, "../test-data/prince-akachi-unsplash.jpg")
      );
      const result = await getImageBuffer(
        "https://avatars.slack-edge.com/images/A12BC3DEF_72.jpg"
      );
      expect(result).toEqual(expected);
    });

    it("should handle fetch errors", async () => {
      server.use(
        rest.get("https://avatars.slack-edge.com/*", async (_, res, ctx) => {
          console.log("intercepting error");
          return res(
            ctx.status(500),
            ctx.json({ errorMessage: "Error retrieving image" })
          );
        })
      );

      const result = await getImageBuffer(
        "https://avatars.slack-edge.com/A12BC3DEF_72.jpg"
      );
      expect(result).toEqual(null);

      server.resetHandlers();
    });
  });

  describe("writeImage", () => {
    const buffer = fs.readFileSync(
      path.resolve(__dirname, "../test-data/prince-akachi-unsplash.jpg")
    );

    it("should save the file", async () => {
      const newFilePath = `${currentDirectory}/dist/images/G78HI9JKL_192.jpg`;
      expect(fs.existsSync(newFilePath)).toBeFalsy();
      await writeImage("G78HI9JKL_192", buffer, "jpg");
      expect(fs.existsSync(newFilePath)).toBeTruthy();
    });
  });

  describe("normalizeName", () => {
    it("should handle a first and last name", () => {
      const [normalizedName, pronouns] = normalizeName("Dominick Osinski");
      expect(pronouns).toEqual("");
      expect(normalizedName).toEqual("Dominick Osinski");
    });

    it("should handle hyphenated names", () => {
      const [normalizedName, pronouns] = normalizeName(
        "Dominick Osinski-Konopelski"
      );
      expect(pronouns).toEqual("");
      expect(normalizedName).toEqual("Dominick Osinski-Konopelski");
    });

    it("should handle a name with two first names", () => {
      const [normalizedName, pronouns] = normalizeName(
        "Constance Angelica Morar"
      );
      expect(pronouns).toEqual("");
      expect(normalizedName).toEqual("Constance Angelica Morar");
    });

    it("should remove additional information from the name", () => {
      const [normalizedName, pronouns] = normalizeName(
        "Angelica Morar (OOO til 5/11)"
      );
      expect(pronouns).toEqual("");
      expect(normalizedName).toEqual("Angelica Morar");
    });

    it("should strip out pronouns from the name", () => {
      const [normalizedName, pronouns] = normalizeName(
        "Angelica Morar (she/her)"
      );
      expect(pronouns).toEqual("she/her");
      expect(normalizedName).toEqual("Angelica Morar");
    });

    it("should handle username", () => {
      const [normalizedName, pronouns] = normalizeName("mpollich");
      expect(pronouns).toEqual("");
      expect(normalizedName).toEqual("mpollich");
    });

    it("should handle stripping pronouns out of the name", () => {
      const [normalizedName, pronouns] = normalizeName(
        "tschamberger (she/her)"
      );
      expect(pronouns).toEqual("she/her");
      expect(normalizedName).toEqual("tschamberger");
    });

    it("should handle stripping out he/him", () => {
      const [normalizedName, pronouns] = normalizeName("tschamberger (he/him)");
      expect(pronouns).toEqual("he/him");
      expect(normalizedName).toEqual("tschamberger");
    });

    it("should handle stripping they/them", () => {
      const [normalizedName, pronouns] = normalizeName(
        "tschamberger (they/them)"
      );
      expect(pronouns).toEqual("they/them");
      expect(normalizedName).toEqual("tschamberger");
    });

    it("should handle stripping out he/they", () => {
      const [normalizedName, pronouns] = normalizeName(
        "tschamberger (he/they)"
      );
      expect(pronouns).toEqual("he/they");
      expect(normalizedName).toEqual("tschamberger");
    });

    it("should handle stripping out she/they", () => {
      const [normalizedName, pronouns] = normalizeName(
        "tschamberger (she/they)"
      );
      expect(pronouns).toEqual("she/they");
      expect(normalizedName).toEqual("tschamberger");
    });
  });

  describe("lookupUserIdByEmail", () => {
    it("should find the user by the email entered", async () => {
      const userId = await lookupUserIdByEmail("mpollich@email.com");
      expect(userId).toEqual("F67GH8IJK");
    });

    it("should look for the user by substituting the fearless.tech domain for the fearsol.com", async () => {
      const userId = await lookupUserIdByEmail("amorar@fearsol.com");
      expect(userId).toEqual("J01KL2MNO");
    });

    it("should look for the user by substituting the fearsol.com domain for fearless.tech", async () => {
      const userId = await lookupUserIdByEmail("tmccullough@fearless.tech");
      expect(userId).toEqual("E56FG7HIJ");
    });

    it("should handle not finding the user", async () => {
      const userId = await lookupUserIdByEmail("nouser@email.com");
      expect(userId).toBeNull();
    });
  });

  describe("getImageUrl", () => {
    const profile: UsersProfileGetResponse = {
      ok: true,
      profile: {
        image_24: "https://avatars.slack-edge.com/images/A12BC3DEF_24.jpg",
        image_32: "https://avatars.slack-edge.com/images/A12BC3DEF_32.jpg",
        image_48: "https://avatars.slack-edge.com/images/A12BC3DEF_48.jpg",
        image_72: "https://avatars.slack-edge.com/images/A12BC3DEF_72.jpg",
        image_192: "https://avatars.slack-edge.com/images/A12BC3DEF_192.jpg",
        image_512: "https://avatars.slack-edge.com/images/A12BC3DEF_512.jpg",
        image_1024: "https://avatars.slack-edge.com/images/A12BC3DEF_1024.jpg",
      },
    };

    it("should return image_72 for 72", () => {
      const imageUrl = getImageUrl(profile, 72);
      expect(imageUrl).toEqual(profile.profile?.image_72);
    });

    it("should return image_192 for 192", () => {
      const imageUrl = getImageUrl(profile, 192);
      expect(imageUrl).toEqual(profile.profile?.image_192);
    });

    it("should return image_192 an invalid number", () => {
      const imageUrl = getImageUrl(profile, 150);
      expect(imageUrl).toEqual(profile.profile?.image_192);
    });
  });

  describe("getUserProfile", () => {
    it("should get user profile with all optional fields", async () => {
      const profile = await getUserProfile("B23CD4EFG", {
        pronounsKey: PRONOUN_FIELD,
        keys: {
          title: TITLE_FIELD,
          herd: HERD_FIELD,
          teams: TEAM_FIELD,
          quotes: QUOTE_FIELD,
          coi: COI_FIELD,
        },
        imageSize: 192,
      });
      expect(profile).toEqual({
        real_name_normalized: "Dallas Konopelski (He/Him)",
        display_name_normalized: "dkonopelski",
        pronouns: "He/Him",
        imageUrl: "https://avatars.slack-edge.com/B23CD4EFG_192.jpg",
        optionalFields: {
          title: "Test Engineer",
          herd: "Engineer Herd",
          teams: "A Team",
          quotes: "It takes strength and courage to admit the truth.",
          coi: "Tester, Accessibility",
        },
      });
    });

    it("should get user profile with title, herd, and teams", async () => {
      const profile = await getUserProfile("A12BC3DEF", {
        pronounsKey: PRONOUN_FIELD,
        keys: {
          title: TITLE_FIELD,
          herd: HERD_FIELD,
          teams: TEAM_FIELD,
        },
        imageSize: 192,
      });
      expect(profile).toEqual({
        real_name_normalized: "Dominick Osinski",
        display_name_normalized: "dosinski",
        pronouns: "He/Him",
        imageUrl: "https://avatars.slack-edge.com/A12BC3DEF_192.jpg",
        optionalFields: {
          title: "Software Engineer",
          herd: "Engineer Herd",
          teams: "A Team",
        },
      });
    });

    it("should get handle profile missing optional fields", async () => {
      const profile = await getUserProfile("E56FG7HIJ", {
        pronounsKey: PRONOUN_FIELD,
        keys: {
          title: TITLE_FIELD,
          coi: COI_FIELD,
          quote: QUOTE_FIELD,
        },
        imageSize: 192,
      });
      expect(profile).toEqual({
        real_name_normalized: "Tracy McCullough (She/Her)",
        display_name_normalized: "tmccullough",
        pronouns: "",
        imageUrl: "https://avatars.slack-edge.com/E56FG7HIJ_192.jpg",
        optionalFields: {
          title: "Operations Assistant",
          coi: "",
          quote: "",
        },
      });
    });

    it("should handle not finding profile", async () => {
      const profile = await getUserProfile("Z56FG7HIJ", {
        pronounsKey: PRONOUN_FIELD,
        keys: {
          title: TITLE_FIELD,
          coi: COI_FIELD,
          quote: QUOTE_FIELD,
        },
        imageSize: 192,
      });
      expect(profile).toBeNull();
    });
  });

  describe("getUserInfo", () => {
    const configs: SlackConfigs = {
      pronounsKey: PRONOUN_FIELD,
      keys: {
        title: TITLE_FIELD,
        herd: HERD_FIELD,
        teams: TEAM_FIELD,
      },
      imageSize: 192,
    };

    it("should find the user by email entered", async () => {
      const userInfo = await getUserInfo("mpollich@email.com", configs);
      expect(userInfo).toEqual({
        name: "May Pollich",
        username: "@mpollich",
        avatar: `${currentDirectory}/dist/images/F67GH8IJK_192.png`,
        pronouns: "she/her",
        optionalFields: {
          title: "Operations Manager",
          herd: "",
          teams: "",
        },
      });
    });

    it("should look for the user by substituting the @fearless.tech domain", async () => {
      const userInfo = await getUserInfo("amorar@fearsol.com", configs);
      expect(userInfo).toEqual({
        name: "Angelica Morar",
        username: "@amorar",
        avatar: `${currentDirectory}/dist/images/J01KL2MNO_192.png`,
        pronouns: "she/her",
        optionalFields: {
          title: "Software Engineer",
          herd: "",
          teams: "",
        },
      });
    });

    it("should look for the user by substituting the @fearsol.com domain", async () => {
      const userInfo = await getUserInfo("tmccullough@fearless.tech", configs);
      expect(userInfo).toEqual({
        name: "Tracy McCullough",
        username: "@tmccullough",
        avatar: `${currentDirectory}/dist/images/E56FG7HIJ_192.png`,
        pronouns: "she/her",
        optionalFields: {
          title: "Operations Assistant",
          herd: "",
          teams: "",
        },
      });
    });

    it("should handle the user not being found by email", async () => {
      const userInfo = await getUserInfo("nouser@email.com", configs);
      expect(userInfo).toBeNull();
    });

    it("should handle the user not having a profile", async () => {
      const userInfo = await getUserInfo("noprofile@email.com", configs);
      expect(userInfo).toBeNull();
    });
  });

  describe("getNameTagInfo", () => {
    const configs: SlackConfigs = {
      pronounsKey: PRONOUN_FIELD,
      keys: {
        title: TITLE_FIELD,
        herd: HERD_FIELD,
        teams: TEAM_FIELD,
      },
      imageSize: 192,
    };

    it("should handle multiple emails", async () => {
      const tags = await getNameTagInfo(
        [
          "mpollich@email.com",
          "amorar@fearless.tech",
          "tmccullough@fearsol.com",
        ],
        configs
      );
      expect(tags).toEqual([
        {
          name: "May Pollich",
          username: "@mpollich",
          avatar: `${currentDirectory}/dist/images/F67GH8IJK_192.png`,
          pronouns: "she/her",
          optionalFields: {
            title: "Operations Manager",
            herd: "",
            teams: "",
          },
        },
        {
          name: "Angelica Morar",
          username: "@amorar",
          avatar: `${currentDirectory}/dist/images/J01KL2MNO_192.png`,
          pronouns: "she/her",
          optionalFields: {
            title: "Software Engineer",
            herd: "",
            teams: "",
          },
        },
        {
          name: "Tracy McCullough",
          username: "@tmccullough",
          avatar: `${currentDirectory}/dist/images/E56FG7HIJ_192.png`,
          pronouns: "she/her",
          optionalFields: {
            title: "Operations Assistant",
            herd: "",
            teams: "",
          },
        },
      ]);
    });

    it("should handle multiple emails with errors", async () => {
      const tags = await getNameTagInfo(
        [
          "mpollich@email.com",
          "amorar@fearless.tech",
          "tmccullough@fearsol.com",
          "nouser@email.com",
          "noprofile@email.com",
        ],
        configs
      );
      expect(tags).toEqual([
        {
          name: "May Pollich",
          username: "@mpollich",
          avatar: `${currentDirectory}/dist/images/F67GH8IJK_192.png`,
          pronouns: "she/her",
          optionalFields: {
            title: "Operations Manager",
            herd: "",
            teams: "",
          },
        },
        {
          name: "Angelica Morar",
          username: "@amorar",
          avatar: `${currentDirectory}/dist/images/J01KL2MNO_192.png`,
          pronouns: "she/her",
          optionalFields: {
            title: "Software Engineer",
            herd: "",
            teams: "",
          },
        },
        {
          name: "Tracy McCullough",
          username: "@tmccullough",
          avatar: `${currentDirectory}/dist/images/E56FG7HIJ_192.png`,
          pronouns: "she/her",
          optionalFields: {
            title: "Operations Assistant",
            herd: "",
            teams: "",
          },
        },
      ]);
    });
  });
});
