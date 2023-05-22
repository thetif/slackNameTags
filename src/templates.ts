import { ReadonlyTemplate } from "name-tag";

/**
 * <!-- =================================================================== -->
 * <!-- Avery 5395 family: Name Badge Labels, 2_1/3'' x 3_3/8'', 8 per sheet -->
 * <!-- =================================================================== -->
 * <Template brand="Avery" part="5395" size="US-Letter" _description="Name Badge Labels">
 *   <Meta category="label"/>
 *   <Label-rectangle id="0" width="3.375in" height="2.333333333in" round="0.1875in" waste="0.0625in">
 *     <Markup-margin size="0.0625in"/>
 *     <Layout nx="2" ny="4" x0="0.6875in" y0="0.583333333in" dx="3.75in" dy="2.5in"/>
 *   </Label-rectangle>
 * </Template>
 * from https://github.com/samlown/glabels/blob/master/templates/avery-us-templates.xml
 * Units are in 1 inch = 72 points"
 */
export const avery5395: ReadonlyTemplate = {
  COLS: 2,
  ROWS: 4,
  LEFT_MARGIN: 0.6875 * 72, // x0
  TOP_MARGIN: 0.583333333 * 72, // y0
  LABEL_WIDTH: 3.375 * 72, // width
  LABEL_HEIGHT: 2.333333333 * 72, // height
  X_STRIDE: 3.75 * 72, // dx
  Y_STRIDE: 2.5 * 72, // dy
  ROUNDED: 0.1875 * 72, // round
  PADDING: 15,
  WASTE: 0.0625 * 72, // waste
  SHOW_OUTLINE: false,
};
