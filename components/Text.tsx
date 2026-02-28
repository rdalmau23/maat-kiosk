import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

/**
 * Drop-in replacement for React Native's Text that always uses Geist.
 * fontWeight values are mapped to the specific Geist font faces to avoid
 * relying on OS font synthesis (which can look different per platform).
 */

const weightToFont: Record<string, string> = {
    '400': 'Geist_400Regular',
    '500': 'Geist_500Medium',
    '600': 'Geist_600SemiBold',
    '700': 'Geist_700Bold',
    '800': 'Geist_900Black',
    '900': 'Geist_900Black',
    normal: 'Geist_400Regular',
    bold: 'Geist_700Bold',
};

export function Text({ style, ...props }: TextProps) {
    const flat = StyleSheet.flatten(style ?? {});
    const weight = String(flat?.fontWeight ?? '400');
    const fontFamily = flat?.fontFamily ?? weightToFont[weight] ?? 'Geist_400Regular';

    return <RNText {...props} style={[styles.base, style, { fontFamily }]} />;
}

const styles = StyleSheet.create({
    base: {
        fontFamily: 'Geist_400Regular',
    },
});
