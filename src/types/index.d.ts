declare module "name-tag" {
  export interface NameTagInfo {
    name: string;
    username: string;
    avatar: string;
    title: string;
    herd: string;
    pronouns: string;
    teams: string;
  }

  type Template = {
    COLS: number;
    ROWS: number;
    LEFT_MARGIN: number;
    TOP_MARGIN: number;
    LABEL_WIDTH: number;
    LABEL_HEIGHT: number;
    X_STRIDE: number;
    Y_STRIDE: number;
    TOP_PAD: number;
    PADDING: number;
    ROUNDED: number;
    WASTE: number;
    SHOW_OUTLINE: boolean;
  };

  export type ReadonlyTemplate = Readonly<Template>;

  export type PDFConfigs = {
    templateName: string;
    regularFont: string;
    boldFont: string;
    altFont?: string;
    italicFont?: string;
  };
}
