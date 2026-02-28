import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, Radii, Shadow } from '@/constants/theme';
import { TagBadge } from './TagBadge';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/Text';

interface ClassCardProps {
    id: string;
    name: string;
    discipline: string;
    startTime: string;
    endTime: string;
    instructor: string;
    instructorAvatar: string;
    capacity: number;
    attendeeCount: number;
    onPress: () => void;
}

export function ClassCard({
    name,
    discipline,
    startTime,
    endTime,
    instructor,
    instructorAvatar,
    capacity,
    attendeeCount,
    onPress,
}: ClassCardProps) {
    const fillPercent = Math.min((attendeeCount / capacity) * 100, 100);
    const isFull = attendeeCount >= capacity;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.75}
        >
            {/* Header: avatar + name */}
            <View style={styles.header}>
                <Image source={{ uri: instructorAvatar }} style={styles.avatar} />
                <View style={styles.headerText}>
                    <Text style={styles.className} numberOfLines={1}>
                        {name}
                    </Text>
                    <Text style={styles.time}>
                        {startTime} – {endTime}
                    </Text>
                </View>
            </View>

            {/* Tag */}
            <TagBadge discipline={discipline} />

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.footerRow}>
                    <Feather name="users" size={11} color={Colors.textMuted} />
                    <Text style={styles.footerText}>
                        {isFull ? (
                            <Text style={{ color: Colors.error }}>Full</Text>
                        ) : (
                            `${attendeeCount}/${capacity}`
                        )}
                    </Text>
                </View>
                <View style={styles.footerRow}>
                    <Feather name="user" size={11} color={Colors.textMuted} />
                    <Text style={styles.footerText} numberOfLines={1}>
                        {instructor}
                    </Text>
                </View>
            </View>

            {/* Capacity bar */}
            <View style={styles.barBg}>
                <View
                    style={[
                        styles.barFill,
                        {
                            width: `${fillPercent}%` as any,
                            backgroundColor: isFull ? Colors.error : Colors.primary,
                        },
                    ]}
                />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: Radii.xl,
        padding: Spacing.lg,
        gap: Spacing.sm,
        ...Shadow.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: Radii.full,
        backgroundColor: Colors.border,
    },
    headerText: {
        flex: 1,
    },
    className: {
        fontSize: Typography.sm,
        fontWeight: Typography.semibold,
        color: Colors.text,
    },
    time: {
        fontSize: Typography.xs,
        color: Colors.textMuted,
        marginTop: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.xs,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    footerText: {
        fontSize: Typography.xs,
        color: Colors.textSecondary,
    },
    barBg: {
        height: 3,
        backgroundColor: Colors.border,
        borderRadius: Radii.full,
        overflow: 'hidden',
        marginTop: Spacing.xs,
    },
    barFill: {
        height: 3,
        borderRadius: Radii.full,
    },
});
