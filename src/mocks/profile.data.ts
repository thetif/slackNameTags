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
    Xf234CDEFG5H: {
      // Pronouns
      value: string;
    };
    Xf012ABCDE3F?: {
      // Title
      value: string;
    };
    Xf123BCDEF4G?: {
      // Herd
      value: string;
    };
    Xf345DEFGH6I?: {
      // Team
      value: string;
    };
    Xf456EFGHI7J?: {
      // Quote
      value: string;
    };
    Xf567FGHIJ8K?: {
      // COI
      value: string;
    };
  };
  image_72: string;
  image_192: string;
}

export const profileByUser: Record<string, SlackProfile> = {
  A12BC3DEF: {
    real_name_normalized: "Dominick Osinski",
    display_name_normalized: "dosinski",
    fields: {
      Xf012ABCDE3F: { value: "Software Engineer" },
      Xf123BCDEF4G: { value: "Engineer Herd" },
      Xf234CDEFG5H: { value: "He/Him" },
      Xf345DEFGH6I: { value: "A Team" },
      Xf567FGHIJ8K: { value: "Testers, Accessibility" },
    },
    image_72: "https://avatars.slack-edge.com/A12BC3DEF_72.jpg",
    image_192: "https://avatars.slack-edge.com/A12BC3DEF_192.jpg",
  },
  B23CD4EFG: {
    real_name_normalized: "Dallas Konopelski (He/Him)",
    display_name_normalized: "dkonopelski",
    fields: {
      Xf123BCDEF4G: { value: "Engineer Herd" },
      Xf012ABCDE3F: { value: "Test Engineer" },
      Xf234CDEFG5H: { value: "He/Him" },
      Xf345DEFGH6I: { value: "A Team" },
      Xf456EFGHI7J: {
        value: "It takes strength and courage to admit the truth.",
      },
      Xf567FGHIJ8K: { value: "Tester, Accessibility" },
    },
    image_72: "https://avatars.slack-edge.com/B23CD4EFG_72.jpg",
    image_192: "https://avatars.slack-edge.com/B23CD4EFG_192.jpg",
  },
  C34DE5FGH: {
    real_name_normalized: "Taylor Schamberger",
    display_name_normalized: "tschamberger (she/her)",
    fields: {
      Xf123BCDEF4G: { value: "Engineer Herd" },
      Xf012ABCDE3F: { value: "Site Reliability Engineer" },
      Xf234CDEFG5H: { value: "She/Her" },
      Xf345DEFGH6I: { value: "A Team" },
    },
    image_72: "https://avatars.slack-edge.com/C34DE5FGH_72.jpg",
    image_192: "https://avatars.slack-edge.com/C34DE5FGH_192.jpg",
  },
  D45EF6GHI: {
    real_name_normalized: "Constance Beer (She/They)",
    display_name_normalized: "cbeer",
    fields: {
      Xf123BCDEF4G: { value: "Design Herd" },
      Xf012ABCDE3F: { value: "Product Designer" },
      Xf234CDEFG5H: { value: "She/Her" },
      Xf345DEFGH6I: { value: "A Team" },
    },
    image_72: "https://avatars.slack-edge.com/D45EF6GHI_72.jpg",
    image_192: "https://avatars.slack-edge.com/D45EF6GHI_192.jpg",
  },
  E56FG7HIJ: {
    real_name_normalized: "Tracy McCullough (She/Her)",
    display_name_normalized: "tmccullough",
    fields: {
      Xf123BCDEF4G: { value: "" },
      Xf012ABCDE3F: { value: "Operations Assistant" },
      Xf234CDEFG5H: { value: "" },
      Xf345DEFGH6I: { value: "" },
    },
    image_72: "https://avatars.slack-edge.com/E56FG7HIJ_72.jpg",
    image_192: "https://avatars.slack-edge.com/E56FG7HIJ_192.jpg",
  },
  F67GH8IJK: {
    real_name_normalized: "May Pollich",
    display_name_normalized: "mpollich (she/her)",
    fields: {
      Xf123BCDEF4G: { value: "" },
      Xf012ABCDE3F: { value: "Operations Manager" },
      Xf234CDEFG5H: { value: "" },
      Xf345DEFGH6I: { value: "" },
    },
    image_72: "https://avatars.slack-edge.com/F67GH8IJK_72.jpg",
    image_192: "https://avatars.slack-edge.com/F67GH8IJK_192.jpg",
  },
  G78HI9JKL: {
    real_name_normalized: "Bryant Hettinger",
    display_name_normalized: "bhettinger",
    fields: {
      Xf123BCDEF4G: { value: "Delivery Herd" },
      Xf012ABCDE3F: { value: "Scrum Master" },
      Xf234CDEFG5H: { value: "" },
      Xf345DEFGH6I: { value: "A Team" },
    },
    image_72: "https://avatars.slack-edge.com/G78HI9JKL_72.jpg",
    image_192: "https://avatars.slack-edge.com/G78HI9JKL_192.jpg",
  },
  H89IJ0KLM: {
    real_name_normalized: "Bonnie Oberbrunner",
    display_name_normalized: "boberbrunner",
    fields: {
      Xf123BCDEF4G: { value: "" },
      Xf012ABCDE3F: { value: "Product Manager" },
      Xf234CDEFG5H: { value: "" },
      Xf345DEFGH6I: { value: "A Team" },
    },
    image_72: "https://avatars.slack-edge.com/H89IJ0KLM_72.jpg",
    image_192: "https://avatars.slack-edge.com/H89IJ0KLM_192.jpg",
  },
  I90JK1LMN: {
    real_name_normalized: "Donnie Adams",
    display_name_normalized: "dadams",
    fields: {
      Xf123BCDEF4G: { value: "" },
      Xf012ABCDE3F: { value: "" },
      Xf234CDEFG5H: { value: "" },
      Xf345DEFGH6I: { value: "A Team" },
    },
    image_72: "https://avatars.slack-edge.com/I90JK1LMN_72.jpg",
    image_192: "https://avatars.slack-edge.com/I90JK1LMN_192.jpg",
  },
  J01KL2MNO: {
    real_name_normalized: "Angelica Morar",
    display_name_normalized: "amorar",
    fields: {
      Xf123BCDEF4G: { value: "" },
      Xf012ABCDE3F: { value: "Software Engineer" },
      Xf234CDEFG5H: { value: "she/her" },
      Xf345DEFGH6I: { value: "" },
    },
    image_72: "https://avatars.slack-edge.com/J01KL2MNO_72.jpg",
    image_192: "https://avatars.slack-edge.com/J01KL2MNO_192.jpg",
  },
};
