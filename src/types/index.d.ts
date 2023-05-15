declare module "name-tag" {
  export type SlackConfigs = {
    keys: {
      pronouns: string;
      [key: string]: string;
    };
    imageSize: 24 | 32 | 48 | 72 | 192 | 512 | 1024;
  };

  export type NameTagInfo = {
    name: string;
    username: string;
    avatar: string;
    optionalFields?: {
      pronouns: string;
      [key: string]: string;
    };
  };

  type Template = {
    COLS: number;
    ROWS: number;
    LEFT_MARGIN: number;
    TOP_MARGIN: number;
    LABEL_WIDTH: number;
    LABEL_HEIGHT: number;
    X_STRIDE: number;
    Y_STRIDE: number;
    PADDING: number;
    ROUNDED: number;
    WASTE: number;
    SHOW_OUTLINE: boolean;
  };

  export type ReadonlyTemplate = Readonly<Template>;

  export type PDFConfigs = {
    template: ReadonlyTemplate;
    baseFontSize: number;
    textPadding: number;
    regularFont: string;
    boldFont: string;
    altFont?: string;
    italicFont?: string;
  };
}
