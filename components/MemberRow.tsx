import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, Radii } from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import { formatTime } from '@/utils/formatTime';
import { Text } from '@/components/Text';

export type MemberStatus = 'confirmed' | 'registered' | 'checked-in';

interface MemberRowProps {
    firstName: string;
    lastName: string;
    profilePicture?: string;
    status?: MemberStatus;
    registeredAt?: string;
    onPress?: () => void;
    showChevron?: boolean;
}

const statusConfig: Record<MemberStatus, { label: string; color: string; bg: string }> = {
    confirmed: { label: 'Confirmed', color: '#15803D', bg: '#DCFCE7' },
    registered: { label: 'Registered', color: '#0E7490', bg: '#CFFAFE' },
    'checked-in': { label: 'Checked in', color: '#6D28D9', bg: '#EDE9FE' },
};

export function MemberRow({
    firstName,
    lastName,
    profilePicture,
    status,
    registeredAt,
    onPress,
    showChevron = false,
}: MemberRowProps) {
    const cfg = status ? statusConfig[status] : null;
    return (
        <TouchableOpacity
            style={styles.row}
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            disabled={!onPress}
        >
            {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Feather name="user" size={20} color={Colors.textMuted} />
                </View>
            )}

            <View style={styles.info}>
                <Text style={styles.name}>
                    {firstName} {lastName}
                </Text>
                {registeredAt && (
                    <Text style={styles.time}>{formatTime(registeredAt)}</Text>
                )}
            </View>

            {cfg && (
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>
                        {cfg.label}
                    </Text>
                </View>
            )}

            {showChevron && (
                <Feather name="chevron-right" size={16} color={Colors.textMuted} style={{ marginLeft: Spacing.xs }} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: Radii.full,
        backgroundColor: Colors.surface,
    },
    avatarPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: Typography.base,
        fontWeight: Typography.medium,
        color: Colors.text,
    },
    time: {
        fontSize: Typography.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        borderRadius: Radii.full,
    },
    statusText: {
        fontSize: Typography.xs,
        fontWeight: Typography.semibold,
    },
});
