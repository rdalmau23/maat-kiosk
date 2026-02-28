// Design tokens — light theme, Geist typography, rounded surfaces

export const Colors = {
    background: '#FFFFFF',
    surface: '#F4F4F4',
    surfaceHover: '#EBEBEB',
    border: '#E8E8E8',
    text: '#111111',
    textSecondary: '#6B6B6B',
    textMuted: '#ABABAB',
    primary: '#111111',
    primaryForeground: '#FFFFFF',
    success: '#16A34A',
    successLight: '#DCFCE7',
    error: '#DC2626',
    errorLight: '#FEE2E2',

    tags: {
        bjj: { bg: '#DCFCE7', text: '#15803D' },
        mma: { bg: '#FEF3C7', text: '#B45309' },
        kids: { bg: '#FCE7F3', text: '#BE185D' },
        grappling: { bg: '#EDE9FE', text: '#6D28D9' },
        wrestling: { bg: '#FEE2E2', text: '#B91C1C' },
        kickboxing: { bg: '#FFF1F2', text: '#9F1239' },
    } as Record<string, { bg: string; text: string }>,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
};

export const Radii = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
};

export const Typography = {
    // Sizes
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    xxxl: 36,

    // Weights — map to loaded Geist font faces
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '900' as const,
};

export const Fonts = {
    regular: 'Geist_400Regular',
    medium: 'Geist_500Medium',
    semibold: 'Geist_600SemiBold',
    bold: 'Geist_700Bold',
    heavy: 'Geist_900Black',
};

export const Shadow = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
};
