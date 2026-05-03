import { brand, neutral, red } from './colors.primitives';

const h = (tuple: string) => `hsl(${tuple})`;

/**
 * Semantic palette for soft-dark (single theme v1).
 * Names align with React Native Reusables / shadcn-style tokens.
 */
export function buildSemanticDark() {
  return {
    background: h(neutral.n950),
    foreground: h(neutral.n50),

    card: h(neutral.n900),
    cardForeground: h(neutral.n50),

    popover: h(neutral.n850),
    popoverForeground: h(neutral.n50),

    muted: h(neutral.n800),
    mutedForeground: h(neutral.n400),

    accent: h(neutral.n800),
    accentForeground: h(neutral.n50),

    primary: h(brand.b500),
    primaryForeground: h(neutral.n50),

    secondary: h(neutral.n800),
    secondaryForeground: h(neutral.n100),

    destructive: h(red.destructive),
    destructiveForeground: h(red.destructiveFg),

    border: h(neutral.n700),
    input: h(neutral.n700),
    ring: h(brand.b400),

    chart1: h('190 46% 52%'),
    chart2: h('173 50% 45%'),
    chart3: h('197 45% 40%'),
    chart4: h('43 55% 58%'),
    chart5: h('27 65% 55%'),

    /** Break / pause — gold on dark zinc; distinct from brand primary (teal). */
    pause: h('42 72% 50%'),
    pauseForeground: h('38 40% 9%'),
    pauseText: h('43 34% 76%'),
    /** Saturated gold for emphasis (e.g. on-break line on the clock card). */
    pauseGold: h('46 96% 56%'),
  } as const;
}

export type SemanticColors = ReturnType<typeof buildSemanticDark>;
