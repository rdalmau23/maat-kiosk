import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { CommonActions } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Colors, Spacing, Typography, Radii } from '@/constants/theme';
import i18n from '@/lib/i18n';

export default function SuccessScreen() {
    const { memberName, className } = useLocalSearchParams<{
        memberName: string;
        className: string;
        classId: string;
    }>();

    const navigation = useNavigation();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
        }).start();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            delay: 200,
            useNativeDriver: true,
        }).start();

        // Auto-reset: clear entire navigation stack and go to home
        const timer = setTimeout(() => {
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'index' }],
                })
            );
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.center}>
                <Animated.View
                    style={[styles.checkCircle, { transform: [{ scale: scaleAnim }] }]}
                >
                    <Feather name="check" size={48} color="#FFFFFF" />
                </Animated.View>

                <Animated.View style={[styles.textBlock, { opacity: fadeAnim }]}>
                    <Text style={styles.title}>{i18n.t('success_screen.title')}</Text>
                    <Text style={styles.memberName}>{memberName}</Text>
                    <Text style={styles.subtitle}>
                        {i18n.t('success_screen.subtitle')}{'\n'}
                        <Text style={styles.className}>{className}</Text>
                    </Text>
                </Animated.View>

                <Animated.Text style={[styles.resetHint, { opacity: fadeAnim }]}>
                    {i18n.t('success_screen.returning')}
                </Animated.Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xxl,
        paddingHorizontal: Spacing.xl,
    },
    checkCircle: {
        width: 112,
        height: 112,
        borderRadius: Radii.full,
        backgroundColor: Colors.success,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textBlock: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    title: {
        fontSize: Typography.xxl,
        fontWeight: Typography.heavy,
        color: Colors.text,
        textAlign: 'center',
    },
    memberName: {
        fontSize: Typography.xl,
        fontWeight: Typography.semibold,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.base,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: Spacing.xs,
        lineHeight: 22,
    },
    className: {
        fontWeight: Typography.semibold,
        color: Colors.text,
    },
    resetHint: {
        fontSize: Typography.sm,
        color: Colors.textMuted,
        textAlign: 'center',
    },
});
