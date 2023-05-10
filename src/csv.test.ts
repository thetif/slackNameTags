import { getUserEmailList } from "./csv";

const EXPECTED_EMAILS = [
  "dosinski@fearless.tech",
  "dkonopelski@fearless.tech",
  "tschamberger@fearless.tech",
  "cbeer@fearless.tech",
  "tmccullough@fearsol.com",
  "mpollich@email.com",
  "bhettinger@fearless.tech",
  "boberbrunner@fearsol.com",
  "dadams@fearless.tech",
  "amorar@fearless.tech",
] as const;

describe("Testing reading emails from csv", () => {
  it("should handling reading emails when they are in the first column", async () => {
    const emails = await getUserEmailList("./test-data/email-first.csv");
    expect(emails).toEqual(EXPECTED_EMAILS);
  });

  it("should handling reading emails when they are in the second column", async () => {
    const emails = await getUserEmailList("./test-data/email-second.csv");
    expect(emails).toEqual(EXPECTED_EMAILS);
  });

  it("should handling reading emails when they are in the last column", async () => {
    const emails = await getUserEmailList("./test-data/email-last.csv");
    expect(emails).toEqual(EXPECTED_EMAILS);
  });

  it("should handle reading emails from a text file", async () => {
    const emails = await getUserEmailList("./test-data/test-emails.txt");
    expect(emails).toEqual(EXPECTED_EMAILS);
  });
});
