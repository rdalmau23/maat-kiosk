import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text } from '@/components/Text';
import { Colors, Spacing, Typography, Radii } from '@/constants/theme';
import { useAuthStore } from '@/store/useAuthStore';
import i18n from '@/lib/i18n';

export default function ProfileScreen() {
    const { profile, signOut } = useAuthStore();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Text style={styles.title}>{i18n.t('profile.title')}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Feather name="x" size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.profileCard}>
                    {profile?.profile_picture ? (
                        <Image source={{ uri: profile.profile_picture }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Feather name="user" size={40} color={Colors.textMuted} />
                        </View>
                    )}

                    <Text style={styles.name}>
                        {profile?.first_name} {profile?.last_name}
                    </Text>

                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>
                            {profile?.role === 'admin' ? 'ADMIN'
                                : profile?.role === 'coach' ? 'COACH' : 'MEMBER'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                >
                    <Feather name="log-out" size={20} color={Colors.error} />
                    <Text style={styles.logoutText}>{i18n.t('profile.logout')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md
    },
    title: { fontSize: Typography.xl, fontWeight: Typography.heavy, color: Colors.text },
    closeBtn: { padding: Spacing.xs },
    content: { flex: 1, padding: Spacing.xl, alignItems: 'center' },
    profileCard: {
        alignItems: 'center',
        backgroundColor: Colors.surface,
        width: '100%',
        padding: Spacing.xxl,
        borderRadius: Radii.xl,
        marginBottom: Spacing.xxl,
        gap: Spacing.md
    },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.surface },
    avatarPlaceholder: {
        backgroundColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center'
    },
    name: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.text },
    roleBadge: {
        backgroundColor: Colors.surfaceHover,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: Radii.full,
    },
    roleText: {
        fontSize: Typography.xs,
        fontWeight: Typography.bold,
        color: Colors.textSecondary,
        letterSpacing: 1,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.errorLight,
        width: '100%',
        paddingVertical: Spacing.lg,
        borderRadius: Radii.lg,
        gap: Spacing.sm,
    },
    logoutText: {
        fontSize: Typography.md,
        fontWeight: Typography.bold,
        color: Colors.error,
    }
});
