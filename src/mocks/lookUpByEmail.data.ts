export interface SlackUser {
  id: string;
  profile: {
    email: string;
  };
}

export const userByEmail: Record<string, SlackUser> = {
  "dosinski@fearless.tech": {
    id: "A12BC3DEF",
    profile: {
      email: "dosinski@fearless.tech",
    },
  },
  "dkonopelski@fearless.tech": {
    id: "B23CD4EFG",
    profile: {
      email: "dkonopelski@fearless.tech",
    },
  },
  "tschamberger@fearless.tech": {
    id: "C34DE5FGH",
    profile: {
      email: "tschamberger@fearless.tech",
    },
  },
  "cbeer@fearless.tech": {
    id: "D45EF6GHI",
    profile: {
      email: "cbeer@fearless.tech",
    },
  },
  "tmccullough@fearsol.com": {
    id: "E56FG7HIJ",
    profile: {
      email: "tmccullough@fearsol.com",
    },
  },
  "mpollich@email.com": {
    id: "F67GH8IJK",
    profile: {
      email: "mpollich@email.com",
    },
  },
  "bhettinger@fearless.tech": {
    id: "G78HI9JKL",
    profile: {
      email: "bhettinger@fearless.tech",
    },
  },
  "boberbrunner@fearsol.com": {
    id: "H89IJ0KLM",
    profile: {
      email: "boberbrunner@fearsol.com",
    },
  },
  "dadams@fearless.tech": {
    id: "I90JK1LMN",
    profile: {
      email: "dadams@fearless.tech",
    },
  },
  "amorar@fearless.tech": {
    id: "J01KL2MNO",
    profile: {
      email: "amorar@fearless.tech",
    },
  },
  "noprofile@email.com": {
    id: "K12LM3NOP",
    profile: {
      email: "noprofile@email.com",
    },
  },
};
