// Shared design tokens for the dashboard surfaces (client + admin).
// Plain JS objects, not CSS variables — this codebase styles everything
// via inline style props, so tokens need to be spreadable into those.
export const theme = {
  color: {
    bg:           '#f6f6fb',
    surface:      '#ffffff',
    surfaceMuted: '#f9f9fd',
    border:       '#ece9f7',
    borderStrong: '#ddd8f0',
    divider:      '#f1eff9',

    ink:      '#15132b',
    inkSoft:  '#4b4767',
    inkFaint: '#8f8aa8',

    accent:      '#4f46e5', // host/product chrome, primary actions
    accentHover: '#4338ca',
    accentSoft:  '#eef0fd',

    live:     '#20b2aa', // anything that connects back to the live site
    liveSoft: '#e6f7f6',

    good:      '#16a34a',
    goodSoft:  '#f0fdf4',
    danger:    '#dc2626',
    dangerSoft:'#fef2f2',
    dangerBorder: '#fecaca',
  },
  radius: { sm: 10, md: 12, lg: 18, pill: 999 },
  shadow: {
    card:  '0 1px 2px rgba(79,70,229,0.04), 0 12px 28px -10px rgba(79,70,229,0.16)',
    raised:'0 2px 4px rgba(79,70,229,0.06), 0 18px 36px -10px rgba(79,70,229,0.2)',
    button:'0 1px 2px rgba(79,70,229,0.08), 0 6px 16px -4px rgba(79,70,229,0.35)',
  },
  font: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
}
