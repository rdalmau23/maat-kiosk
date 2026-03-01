import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Text } from '@/components/Text';
import { Colors, Spacing, Typography, Radii, Shadow } from '@/constants/theme';
import { useAuthStore } from '@/store/useAuthStore';
import i18n from '@/lib/i18n';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError(i18n.t('login.empty_fields_error'));
            return;
        }

        setLoading(true);
        setError('');
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);

        if (authError) {
            setError(i18n.t('login.invalid_login'));
        } else {
            // Success! The useAuthStore will catch the event and _layout.tsx will redirect us.
            router.replace('/');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.formContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{i18n.t('login.welcome')}</Text>
                        <Text style={styles.subtitle}>{i18n.t('login.subtitle')}</Text>
                    </View>

                    {error ? (
                        <View style={styles.errorBox}>
                            <Feather name="alert-circle" size={16} color={Colors.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{i18n.t('login.email')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor={Colors.textSecondary}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{i18n.t('login.password')}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={Colors.textSecondary}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={Colors.primaryForeground} />
                        ) : (
                            <Text style={styles.loginBtnText}>{i18n.t('login.login_btn')}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    keyboardView: { flex: 1 },
    formContainer: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl * 1.5,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: Radii.full,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xl,
        ...Shadow.md,
    },
    title: {
        fontSize: Typography.xxxl,
        fontWeight: Typography.heavy,
        color: Colors.text,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.base,
        color: Colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.error + '15',
        padding: Spacing.md,
        borderRadius: Radii.lg,
        marginBottom: Spacing.xl,
        gap: Spacing.sm,
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.sm,
        flex: 1,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: Typography.sm,
        fontWeight: Typography.bold,
        color: Colors.text,
        marginBottom: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: Radii.xl,
        padding: Spacing.lg,
        fontSize: Typography.base,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    loginBtn: {
        backgroundColor: Colors.primary,
        borderRadius: Radii.full,
        padding: Spacing.lg,
        alignItems: 'center',
        marginTop: Spacing.xl,
        ...Shadow.md,
    },
    loginBtnDisabled: {
        opacity: 0.7,
    },
    loginBtnText: {
        color: Colors.primaryForeground,
        fontSize: Typography.lg,
        fontWeight: Typography.bold,
    },
});
