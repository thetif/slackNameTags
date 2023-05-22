export const PRONOUN_FIELD = "Xf234CDEFG5H";
export const TITLE_FIELD = "Xf012ABCDE3F";
export const HERD_FIELD = "Xf123BCDEF4G";
export const TEAM_FIELD = "Xf345DEFGH6I";
export const QUOTE_FIELD = "Xf456EFGHI7J";
export const COI_FIELD = "Xf567FGHIJ8K";

export interface SlackProfile {
  real_name_normalized: string;
  display_name_normalized: string;
  fields: {
    [PRONOUN_FIELD]: { value: string };
    [TITLE_FIELD]?: { value: string };
    [HERD_FIELD]?: { value: string };
    [TEAM_FIELD]?: { value: string };
    [QUOTE_FIELD]?: { value: string };
    [COI_FIELD]?: { value: string };
  };
  image_72: string;
  image_192: string;
}

// mock data for profileByUser
export const profileByUser: Record<string, SlackProfile> = {
  A12BC3DEF: {
    real_name_normalized: "Dominick Osinski",
    display_name_normalized: "dosinski",
    fields: {
      [TITLE_FIELD]: { value: "Software Engineer" },
      [HERD_FIELD]: { value: "Engineer Herd" },
      [PRONOUN_FIELD]: { value: "He/Him" },
      [TEAM_FIELD]: { value: "A Team" },
      [COI_FIELD]: { value: "Testers, Accessibility" },
    },
    image_72: "https://avatars.slack-edge.com/A12BC3DEF_72.jpg",
    image_192: "https://avatars.slack-edge.com/A12BC3DEF_192.jpg",
  },
  B23CD4EFG: {
    real_name_normalized: "Dallas Konopelski (He/Him)",
    display_name_normalized: "dkonopelski",
    fields: {
      [HERD_FIELD]: { value: "Engineer Herd" },
      [TITLE_FIELD]: { value: "Test Engineer" },
      [PRONOUN_FIELD]: { value: "He/Him" },
      [TEAM_FIELD]: { value: "A Team" },
      [QUOTE_FIELD]: {
        value: "It takes strength and courage to admit the truth.",
      },
      [COI_FIELD]: { value: "Tester, Accessibility" },
    },
    image_72: "https://avatars.slack-edge.com/B23CD4EFG_72.jpg",
    image_192: "https://avatars.slack-edge.com/B23CD4EFG_192.jpg",
  },
  C34DE5FGH: {
    real_name_normalized: "Taylor Schamberger",
    display_name_normalized: "tschamberger (she/her)",
    fields: {
      [HERD_FIELD]: { value: "Engineer Herd" },
      [TITLE_FIELD]: { value: "Site Reliability Engineer" },
      [PRONOUN_FIELD]: { value: "She/Her" },
      [TEAM_FIELD]: { value: "A Team" },
    },
    image_72: "https://avatars.slack-edge.com/C34DE5FGH_72.jpg",
    image_192: "https://avatars.slack-edge.com/C34DE5FGH_192.jpg",
  },
  D45EF6GHI: {
    real_name_normalized: "Constance Beer (She/They)",
    display_name_normalized: "cbeer",
    fields: {
      [HERD_FIELD]: { value: "Design Herd" },
      [TITLE_FIELD]: { value: "Product Designer" },
      [PRONOUN_FIELD]: { value: "She/Her" },
      [TEAM_FIELD]: { value: "A Team" },
    },
    image_72: "https://avatars.slack-edge.com/D45EF6GHI_72.jpg",
    image_192: "https://avatars.slack-edge.com/D45EF6GHI_192.jpg",
  },
  E56FG7HIJ: {
    real_name_normalized: "Tracy McCullough (She/Her)",
    display_name_normalized: "tmccullough",
    fields: {
      [HERD_FIELD]: { value: "" },
      [TITLE_FIELD]: { value: "Operations Assistant" },
      [PRONOUN_FIELD]: { value: "" },
      [TEAM_FIELD]: { value: "" },
    },
    image_72: "https://avatars.slack-edge.com/E56FG7HIJ_72.jpg",
    image_192: "https://avatars.slack-edge.com/E56FG7HIJ_192.jpg",
  },
  F67GH8IJK: {
    real_name_normalized: "May Pollich",
    display_name_normalized: "mpollich (she/her)",
    fields: {
      [HERD_FIELD]: { value: "" },
      [TITLE_FIELD]: { value: "Operations Manager" },
      [PRONOUN_FIELD]: { value: "" },
      [TEAM_FIELD]: { value: "" },
    },
    image_72: "https://avatars.slack-edge.com/F67GH8IJK_72.jpg",
    image_192: "https://avatars.slack-edge.com/F67GH8IJK_192.jpg",
  },
  G78HI9JKL: {
    real_name_normalized: "Bryant Hettinger",
    display_name_normalized: "bhettinger",
    fields: {
      [HERD_FIELD]: { value: "Delivery Herd" },
      [TITLE_FIELD]: { value: "Scrum Master" },
      [PRONOUN_FIELD]: { value: "" },
      [TEAM_FIELD]: { value: "A Team" },
    },
    image_72: "https://avatars.slack-edge.com/G78HI9JKL_72.jpg",
    image_192: "https://avatars.slack-edge.com/G78HI9JKL_192.jpg",
  },
  H89IJ0KLM: {
    real_name_normalized: "Bonnie Oberbrunner",
    display_name_normalized: "boberbrunner",
    fields: {
      [HERD_FIELD]: { value: "" },
      [TITLE_FIELD]: { value: "Product Manager" },
      [PRONOUN_FIELD]: { value: "" },
      [TEAM_FIELD]: { value: "A Team" },
    },
    image_72: "https://avatars.slack-edge.com/H89IJ0KLM_72.jpg",
    image_192: "https://avatars.slack-edge.com/H89IJ0KLM_192.jpg",
  },
  I90JK1LMN: {
    real_name_normalized: "Donnie Adams",
    display_name_normalized: "dadams",
    fields: {
      [HERD_FIELD]: { value: "" },
      [TITLE_FIELD]: { value: "" },
      [PRONOUN_FIELD]: { value: "" },
      [TEAM_FIELD]: { value: "A Team" },
    },
    image_72: "https://avatars.slack-edge.com/I90JK1LMN_72.jpg",
    image_192: "https://avatars.slack-edge.com/I90JK1LMN_192.jpg",
  },
  J01KL2MNO: {
    real_name_normalized: "Angelica Morar",
    display_name_normalized: "amorar",
    fields: {
      [HERD_FIELD]: { value: "" },
      [TITLE_FIELD]: { value: "Software Engineer" },
      [PRONOUN_FIELD]: { value: "she/her" },
      [TEAM_FIELD]: { value: "" },
    },
    image_72: "https://avatars.slack-edge.com/J01KL2MNO_72.jpg",
    image_192: "https://avatars.slack-edge.com/J01KL2MNO_192.jpg",
  },
};
