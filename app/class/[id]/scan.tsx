import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { Text } from '@/components/Text';
import { Colors, Spacing, Typography, Radii } from '@/constants/theme';
import { insertCheckIn, fetchClassCheckInCount, fetchClass } from '@/lib/api';
import i18n from '@/lib/i18n';

export default function ScanScreen() {
    const { id: classId } = useLocalSearchParams<{ id: string }>();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (scanned || submitting || !classId) return;
        setScanned(true);

        try {
            // 1. Parse payload (safely handle non-JSON QRs)
            let payload;
            try {
                payload = JSON.parse(data);
            } catch (err) {
                throw new Error(i18n.t('qr.invalid', { defaultValue: 'Código QR no reconocido' }));
            }

            if (!payload.memberId || !payload.classId || !payload.timestamp) {
                throw new Error(i18n.t('qr.invalid', { defaultValue: 'Código QR no reconocido' }));
            }

            // 2. Validate Class ID match
            if (payload.classId !== classId) {
                throw new Error(i18n.t('qr.invalid_class'));
            }

            // 3. Validate 5 minutes window (5 * 60 * 1000 = 300,000 ms)
            const timeElapsed = Date.now() - payload.timestamp;
            if (timeElapsed > 300000 || timeElapsed < 0) {
                throw new Error(i18n.t('qr.expired'));
            }

            // 4. Validate Capacity Limit
            setSubmitting(true);
            const currentCount = await fetchClassCheckInCount(classId);
            const cls = await fetchClass(classId);
            if (!cls) throw new Error("Class format error.");

            if (currentCount >= cls.capacity) {
                Alert.alert(i18n.t('class.capacity_full'), i18n.t('checkin.class_full_msg'));
                setSubmitting(false);
                setTimeout(() => setScanned(false), 2000);
                return;
            }

            // 5. Success! Execute Check-In
            await insertCheckIn(classId, payload.memberId);
            router.replace({
                pathname: '/success',
                params: {
                    memberName: i18n.t('qr.scanned_member'),
                    className: cls.name,
                    classId
                },
            });

        } catch (e: any) {
            Alert.alert(i18n.t('checkin.error'), e.message ?? i18n.t('qr.invalid'));
            setSubmitting(false);
            // Re-allow scanning after error
            setTimeout(() => setScanned(false), 2000);
        }
    };

    if (!permission) {
        return <View style={styles.safe} />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.center}>
                    <Text style={styles.text}>{i18n.t('qr.cam_permission')}</Text>
                    <TouchableOpacity onPress={requestPermission} style={styles.btn}>
                        <Text style={styles.btnText}>{i18n.t('qr.grant_permission')}</Text>
                    </TouchableOpacity>
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
                    <Feather name="x" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>{i18n.t('qr.scan_title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.cameraContainer}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />

                <View style={styles.overlay}>
                    <View style={styles.targetBox} />
                    <Text style={styles.scanText}>
                        {i18n.t('qr.point_cam')}
                    </Text>
                </View>
            </View>

            {submitting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loadingText}>{i18n.t('qr.validating')}</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
        zIndex: 10
    },
    title: { fontSize: Typography.xl, fontWeight: Typography.heavy, color: '#fff' },
    closeBtn: { padding: Spacing.xs },
    cameraContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: Radii.xl,
        borderTopRightRadius: Radii.xl,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    targetBox: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: 'transparent',
    },
    scanText: {
        color: '#fff',
        fontSize: Typography.base,
        fontWeight: Typography.bold,
        marginTop: Spacing.xxl,
        textAlign: 'center',
        paddingHorizontal: Spacing.xl,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3
    },
    text: { color: '#fff', fontSize: Typography.base, textAlign: 'center', marginBottom: Spacing.lg },
    btn: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: Radii.lg },
    btnText: { color: '#fff', fontWeight: Typography.bold },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20
    },
    loadingText: {
        color: '#fff',
        fontSize: Typography.md,
        fontWeight: Typography.bold,
        marginTop: Spacing.md
    }
});
