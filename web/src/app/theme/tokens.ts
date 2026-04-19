export const uiTokens = {
  color: {
    bgPage: '#efe7d6',
    bgPanel: '#fffdf8',
    bgPanelMuted: '#f8f3e8',
    border: '#dfd3bf',
    borderHover: '#c7b59a',
    textPrimary: '#2f2a23',
    textSecondary: '#7a6f61',
    primary: '#3f6fd8',
    primaryHover: '#5a84df',
    primaryPressed: '#315cbc',
    primarySoft: '#e9f1ff',
    danger: '#d14343',
    dangerSoft: '#fff1f0',
  },
  radius: {
    sm: '6px',
    md: '8px',
  },
  size: {
    font: '13px',
    inputSm: '30px',
    buttonSm: '28px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
  },
} as const

export const naiveThemeOverrides = {
  common: {
    primaryColor: uiTokens.color.primary,
    primaryColorHover: uiTokens.color.primaryHover,
    primaryColorPressed: uiTokens.color.primaryPressed,
    errorColor: uiTokens.color.danger,
    errorColorHover: uiTokens.color.danger,
    errorColorPressed: uiTokens.color.danger,
    borderRadius: uiTokens.radius.md,
    fontSize: uiTokens.size.font,
  },
  Card: {
    paddingSmall: '10px 12px 12px 12px',
    titleFontSizeSmall: uiTokens.size.font,
  },
  Input: {
    heightSmall: uiTokens.size.inputSm,
  },
  Button: {
    heightSmall: uiTokens.size.buttonSm,
  },
  Tag: {
    borderRadiusSmall: uiTokens.radius.sm,
  },
} as const
