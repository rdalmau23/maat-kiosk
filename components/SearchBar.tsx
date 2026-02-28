import React from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Spacing, Radii, Typography } from '@/constants/theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
    onClear?: () => void;
}

export function SearchBar({
    value,
    onChangeText,
    placeholder = 'Search members...',
    autoFocus = false,
    onClear,
}: SearchBarProps) {
    return (
        <View style={styles.container}>
            <Feather name="search" size={20} color={Colors.textMuted} style={styles.icon} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
                autoFocus={autoFocus}
                autoCorrect={false}
                autoCapitalize="none"
                clearButtonMode="never"
                returnKeyType="search"
            />
            {value.length > 0 && (
                <TouchableOpacity
                    onPress={() => {
                        onChangeText('');
                        onClear?.();
                    }}
                    style={styles.clearBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Feather name="x-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: Radii.xl,
        paddingHorizontal: Spacing.lg,
        height: 52,
        gap: Spacing.sm,
    },
    icon: {
        flexShrink: 0,
    },
    input: {
        flex: 1,
        fontSize: Typography.base,
        color: Colors.text,
        fontWeight: Typography.regular,
    },
    clearBtn: {
        flexShrink: 0,
    },
});
