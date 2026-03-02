import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { Text } from '@/components/Text';
import { Colors, Spacing, Typography, Radii, Shadow } from '@/constants/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { useCacheStore } from '@/store/useCacheStore';
import { isMemberCheckedIn } from '@/lib/api';
import i18n from '@/lib/i18n';

export default function QRCodeScreen() {
    const { profile } = useAuthStore();
    const { id: classId } = useLocalSearchParams<{ id: string }>();
    const { classes } = useCacheStore();

    const cls = classes.find(c => c.id === classId);

    const qrPayload = useMemo(() => {
        if (!classId || !profile?.id) return '';

        const payload = {
            classId,
            memberId: profile.id,
            timestamp: Date.now()
        };
        return JSON.stringify(payload);
    }, [classId, profile?.id]);

    useEffect(() => {
        if (!classId || !profile?.id) return;

        let isMounted = true;
        let interval: NodeJS.Timeout;

        const checkStatus = async () => {
            try {
                const checkedIn = await isMemberCheckedIn(classId, profile.id);
                if (checkedIn && isMounted) {
                    clearInterval(interval);
                    router.replace({
                        pathname: '/success',
                        params: {
                            memberName: `${profile.first_name} ${profile.last_name}`,
                            className: cls?.name ?? 'Class',
                            classId
                        },
                    });
                }
            } catch (error) {
                // Ignore silent poll errors
            }
        };

        interval = setInterval(checkStatus, 3000);
        checkStatus(); // Initial check

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [classId, profile?.id, cls?.name]);

    if (!classId || !profile) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.center}>
                    <Text style={{ color: Colors.error }}>{i18n.t('checkin.error')}</Text>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: Spacing.xl }}>
                        <Text style={{ color: Colors.primary }}>{i18n.t('qr.go_back')}</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Feather name="x" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>{i18n.t('qr.pass_title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.description}>
                    {i18n.t('qr.pass_desc')}
                </Text>

                <View style={styles.qrCard}>
                    <QRCode
                        value={qrPayload}
                        size={250}
                        color={Colors.text}
                        backgroundColor={Colors.surface}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    description: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xxxl,
    },
    qrCard: {
        backgroundColor: Colors.surface,
        padding: Spacing.xxl,
        borderRadius: Radii.xl,
        ...Shadow.md,
    }
});
