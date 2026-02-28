import React from 'react';
import {
    View,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Text } from '@/components/Text';
import { Colors, Typography, Spacing, Radii } from '@/constants/theme';

interface HeroBannerProps {
    title: string;
    subtitle?: string;
    imageUri: string;
    onPress?: () => void;
    dark?: boolean;
}

export function HeroBanner({
    title,
    subtitle,
    imageUri,
    onPress,
    dark = false,
}: HeroBannerProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            disabled={!onPress}
            style={styles.container}
        >
            <ImageBackground
                source={{ uri: imageUri }}
                style={styles.image}
                imageStyle={{ borderRadius: Radii.xl }}
                resizeMode="cover"
            >
                {/* Gradient overlay */}
                <View style={[styles.overlay, dark && styles.overlayDark]} />
                <View style={styles.content}>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    <Text style={styles.title}>{title}</Text>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: Radii.xl,
        overflow: 'hidden',
    },
    image: {
        height: 180,
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: Radii.xl,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    overlayDark: {
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    content: {
        padding: Spacing.xl,
        gap: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.xs,
        fontWeight: Typography.semibold,
        color: 'rgba(255,255,255,0.75)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: Typography.xl,
        fontWeight: Typography.heavy,
        color: '#FFFFFF',
        lineHeight: 28,
    },
});
