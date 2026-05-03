import { buildSemanticDark } from '../tokens/colors.semantic';
import { radii } from '../tokens/radii';
import { spacing } from '../tokens/spacing';
import {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
} from '../tokens/typography';

export const darkTheme = {
  colors: buildSemanticDark(),
  radius: radii,
  spacing,
  font: {
    family: fontFamily,
    size: fontSize,
    lineHeight,
    weight: fontWeight,
  },
} as const;

export type AppTheme = typeof darkTheme;
