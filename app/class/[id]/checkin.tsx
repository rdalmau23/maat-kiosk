import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Image,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Colors, Spacing, Typography, Radii, Shadow } from '@/constants/theme';
import { fetchClass, insertCheckIn } from '@/lib/api';

export default function CheckInScreen() {
    const { id: classId, memberId, memberName, memberAvatar } =
        useLocalSearchParams<{
            id: string;
            memberId: string;
            memberName: string;
            memberAvatar: string;
        }>();

    const [className, setClassName] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        if (!classId) return;
        const cls = await fetchClass(classId);
        setClassName(cls?.name ?? '');
        setLoading(false);
    }, [classId]);

    useEffect(() => { load(); }, [load]);

    const handleCheckIn = async () => {
        if (!classId || !memberId || submitting) return;
        setSubmitting(true);
        try {
            await insertCheckIn(classId, memberId);
            router.replace({
                pathname: '/success',
                params: { memberName, className, classId },
            });
        } catch (e: any) {
            setSubmitting(false);
            Alert.alert('Check-in failed', e?.message ?? 'Please try again.');
        }
    };

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long',
    });

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Feather name="x" size={22} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.topTitle}>Confirm Check-In</Text>
                <View style={{ width: 38 }} />
            </View>

            {/* Member Card */}
            <View style={styles.card}>
                {memberAvatar ? (
                    <Image source={{ uri: memberAvatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Feather name="user" size={40} color={Colors.textMuted} />
                    </View>
                )}
                <Text style={styles.memberName}>{memberName}</Text>
                <Text style={styles.dateText}>{today}</Text>

                <View style={styles.classPill}>
                    <Text style={styles.classPillText}>{className}</Text>
                </View>
            </View>

            {/* CTA */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.checkInBtn, submitting && styles.checkInBtnDisabled]}
                    onPress={handleCheckIn}
                    activeOpacity={0.85}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Feather name="check" size={22} color="#fff" />
                            <Text style={styles.checkInText}>Check In</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
    closeBtn: { padding: Spacing.sm },
    topTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.text },
    card: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.xl },
    avatar: { width: 120, height: 120, borderRadius: Radii.full, backgroundColor: Colors.surface },
    avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    memberName: { fontSize: Typography.xxl, fontWeight: Typography.heavy, color: Colors.text, textAlign: 'center' },
    dateText: { fontSize: Typography.sm, color: Colors.textMuted },
    classPill: { backgroundColor: Colors.surface, borderRadius: Radii.full, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
    classPillText: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.text },
    footer: { padding: Spacing.xl, paddingBottom: Spacing.xxxl },
    checkInBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radii.full, paddingVertical: Spacing.xl, ...Shadow.md },
    checkInBtnDisabled: { opacity: 0.6 },
    checkInText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: '#fff' },
});
