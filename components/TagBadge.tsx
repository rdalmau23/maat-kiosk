import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radii } from '@/constants/theme';

interface TagBadgeProps {
    discipline: string;
}

const disciplineLabels: Record<string, string> = {
    bjj: 'BJJ',
    mma: 'MMA',
    kids: 'KIDS',
    grappling: 'GRAPPLING',
    crossfit: 'CROSSFIT',
    wrestling: 'WRESTLING',
    kickboxing: 'KICKBOXING',
};

export function TagBadge({ discipline }: TagBadgeProps) {
    const key = discipline.toLowerCase();
    const colors = Colors.tags[key] ?? { bg: '#F3F4F6', text: '#374151' };
    const label = disciplineLabels[key] ?? discipline.toUpperCase();

    return (
        <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radii.full,
        alignSelf: 'flex-start',
    },
    label: {
        fontSize: Typography.xs,
        fontWeight: Typography.bold,
        letterSpacing: 0.5,
    },
});
