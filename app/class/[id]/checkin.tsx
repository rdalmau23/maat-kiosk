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
import { fetchClass, insertCheckIn, deleteCheckIn, insertAttendee, deleteAttendee, fetchClassCheckInCount } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import i18n from '@/lib/i18n';

export default function CheckInScreen() {
    const { profile } = useAuthStore();
    const isCoachOrAdmin = profile?.role === 'admin' || profile?.role === 'coach';

    const { id: classId, memberId, memberName, memberAvatar, isCheckedIn, isRegistered } =
        useLocalSearchParams<{
            id: string;
            memberId: string;
            memberName: string;
            memberAvatar: string;
            isCheckedIn?: string;
            isRegistered?: string;
        }>();

    const isAlreadyCheckedIn = isCheckedIn === 'true';
    const isAlreadyRegistered = isRegistered === 'true';

    const [className, setClassName] = useState('');
    const [classCapacity, setClassCapacity] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        if (!classId) return;
        const cls = await fetchClass(classId);
        setClassName(cls?.name ?? '');
        setClassCapacity(cls?.capacity ?? 0);
        setLoading(false);
    }, [classId]);

    useEffect(() => { load(); }, [load]);

    const handleAction = async (type: 'register' | 'unregister' | 'checkin' | 'uncheckin') => {
        if (!classId || !memberId || submitting) return;

        setSubmitting(true);
        try {
            if (type === 'checkin') {
                const currentCount = await fetchClassCheckInCount(classId);
                if (currentCount >= classCapacity) {
                    Alert.alert(i18n.t('class.capacity_full'), i18n.t('checkin.class_full_msg'));
                    setSubmitting(false);
                    return;
                }
                await insertCheckIn(classId, memberId);
                router.replace({
                    pathname: '/success',
                    params: { memberName, className, classId },
                });
            } else if (type === 'uncheckin') {
                await deleteCheckIn(classId, memberId);
                router.back();
            } else if (type === 'register') {
                await insertAttendee(classId, memberId);
                router.replace({
                    pathname: '/success',
                    params: { memberName, className, classId, isRegistration: 'true' },
                });
            } else if (type === 'unregister') {
                await deleteAttendee(classId, memberId);
                router.back();
            }
        } catch (e: any) {
            setSubmitting(false);
            Alert.alert(i18n.t('checkin.error'), e?.message ?? i18n.t('checkin.try_again'));
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
                <Text style={styles.topTitle}>
                    {isCoachOrAdmin
                        ? (isAlreadyCheckedIn ? i18n.t('checkin.cancel_checkin') : i18n.t('checkin.confirm_checkin'))
                        : (isAlreadyRegistered ? i18n.t('checkin.cancel_registration') : i18n.t('checkin.register'))}
                </Text>
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
                {isCoachOrAdmin ? (
                    // COACH SINGLE BUTTON
                    <TouchableOpacity
                        style={[styles.checkInBtn, isAlreadyCheckedIn && styles.cancelBtn, submitting && styles.checkInBtnDisabled]}
                        onPress={() => handleAction(isAlreadyCheckedIn ? 'uncheckin' : 'checkin')}
                        activeOpacity={0.85}
                        disabled={submitting}
                    >
                        {submitting ? <ActivityIndicator color={isAlreadyCheckedIn ? Colors.error : "#fff"} /> : (
                            <>
                                <Feather name={isAlreadyCheckedIn ? "x" : "check"} size={22} color={isAlreadyCheckedIn ? Colors.error : "#fff"} />
                                <Text style={[styles.checkInText, isAlreadyCheckedIn && styles.cancelText]}>
                                    {isAlreadyCheckedIn ? i18n.t('checkin.cancel_checkin') : i18n.t('checkin.confirm_checkin')}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                ) : (
                    // MEMBER BUTTONS
                    <View style={{ gap: Spacing.md, width: '100%' }}>
                        {!isAlreadyRegistered && !isAlreadyCheckedIn ? (
                            <TouchableOpacity
                                style={[styles.checkInBtn, submitting && styles.checkInBtnDisabled]}
                                onPress={() => handleAction('register')}
                                activeOpacity={0.85}
                                disabled={submitting}
                            >
                                {submitting ? <ActivityIndicator color="#fff" /> : (
                                    <>
                                        <Feather name="calendar" size={22} color="#fff" />
                                        <Text style={styles.checkInText}>{i18n.t('checkin.register')}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : null}

                        {isAlreadyRegistered && !isAlreadyCheckedIn ? (
                            <>
                                <TouchableOpacity
                                    style={[styles.checkInBtn, submitting && styles.checkInBtnDisabled, { backgroundColor: Colors.success }]}
                                    onPress={() => handleAction('checkin')}
                                    activeOpacity={0.85}
                                    disabled={submitting}
                                >
                                    {submitting ? <ActivityIndicator color="#fff" /> : (
                                        <>
                                            <Feather name="check-circle" size={22} color="#fff" />
                                            <Text style={styles.checkInText}>{i18n.t('class.confirm_attendance')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.checkInBtn, styles.cancelBtn, submitting && styles.checkInBtnDisabled]}
                                    onPress={() => handleAction('unregister')}
                                    activeOpacity={0.85}
                                    disabled={submitting}
                                >
                                    {submitting ? <ActivityIndicator color={Colors.error} /> : (
                                        <>
                                            <Feather name="x" size={22} color={Colors.error} />
                                            <Text style={[styles.checkInText, styles.cancelText]}>{i18n.t('checkin.cancel_registration')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : null}

                        {isAlreadyCheckedIn ? (
                            <TouchableOpacity
                                style={[styles.checkInBtn, styles.cancelBtn, submitting && styles.checkInBtnDisabled]}
                                onPress={() => handleAction('uncheckin')}
                                activeOpacity={0.85}
                                disabled={submitting}
                            >
                                {submitting ? <ActivityIndicator color={Colors.error} /> : (
                                    <>
                                        <Feather name="x-circle" size={22} color={Colors.error} />
                                        <Text style={[styles.checkInText, styles.cancelText]}>{i18n.t('checkin.cancel_attendance')}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : null}
                    </View>
                )}
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
    cancelBtn: { backgroundColor: Colors.errorLight },
    checkInBtnDisabled: { opacity: 0.6 },
    checkInText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: '#fff' },
    cancelText: { color: Colors.error },
});
