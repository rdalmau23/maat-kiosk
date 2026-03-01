import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ListRenderItem,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Text } from '@/components/Text';
import { Colors, Spacing, Typography, Radii } from '@/constants/theme';
import { ClassCard } from '@/components/ClassCard';
import { HeroBanner } from '@/components/HeroBanner';
import { fetchClasses, fetchAttendeeCounts, type Class } from '@/lib/api';
import { useCacheStore } from '@/store/useCacheStore';
import { useAuthStore } from '@/store/useAuthStore';
import i18n from '@/lib/i18n';
import { Image, TouchableOpacity } from 'react-native';

function pairItems<T>(items: T[]): (T | null)[][] {
    const rows: (T | null)[][] = [];
    for (let i = 0; i < items.length; i += 2) {
        rows.push([items[i], items[i + 1] ?? null]);
    }
    return rows;
}

type ListItem =
    | { type: 'header' }
    | { type: 'hero' }
    | { type: 'section'; count: number }
    | { type: 'row'; items: (Class | null)[] };

export default function HomeScreen() {
    const { classes: cachedClasses, counts: cachedCounts, setClassesData } = useCacheStore();
    const { profile } = useAuthStore();

    // Determine initial loading state: if we have cache, we don't need to block the UI
    const [loading, setLoading] = useState(cachedClasses.length === 0);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const [data, attendeeCounts] = await Promise.all([
                fetchClasses(),
                fetchAttendeeCounts(),
            ]);
            // Update cache store (which triggers a re-render automatically)
            setClassesData(data, attendeeCounts);
        } catch (e) {
            console.error('Failed to load classes (offline?):', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [setClassesData]);

    useEffect(() => { load(); }, [load]);

    const onRefresh = () => { setRefreshing(true); load(); };

    const today = new Date()
        .toLocaleDateString('en-US', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
        .toUpperCase();

    const listData: ListItem[] = React.useMemo(() => {
        if (loading) return [{ type: 'header' }, { type: 'hero' }];

        // If data is empty, we show empty state instead of crashing.
        if (!cachedClasses || cachedClasses.length === 0) {
            return [
                { type: 'header' },
                { type: 'hero' },
                { type: 'section', count: 0 }, // Show 0 classes if empty
            ];
        }

        const sortedClasses = [...cachedClasses].sort((a, b) => a.start_time.localeCompare(b.start_time));
        const rows = pairItems(sortedClasses);
        return [
            { type: 'header' },
            { type: 'hero' },
            { type: 'section', count: sortedClasses.length },
            ...rows.map((items) => ({ type: 'row' as const, items })),
        ];
    }, [cachedClasses, loading]);

    const renderItem: ListRenderItem<ListItem> = ({ item }) => {
        if (item.type === 'header') {
            return (
                <View style={styles.headerContainer}>
                    <View style={styles.headerTextGroup}>
                        <Text style={styles.dateText}>{today}</Text>
                        <Text style={styles.welcomeTitle}>{i18n.t('home.welcome')}</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.8}>
                        {profile?.profile_picture ? (
                            <Image source={{ uri: profile.profile_picture }} style={styles.headerAvatar} />
                        ) : (
                            <View style={styles.headerAvatarPlaceholder}>
                                <Text style={styles.headerAvatarInitial}>
                                    {profile?.first_name?.charAt(0) || '?'}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            );
        }
        if (item.type === 'hero') {
            return (
                <View style={styles.heroPadding}>
                    <HeroBanner
                        title="Open Mat Invitation"
                        subtitle="Triangle Fight Studio × MAAT"
                        imageUri="https://images.unsplash.com/photo-1555597673-b21d5c935865?w=900&q=80"
                    />
                </View>
            );
        }
        if (item.type === 'section') {
            return (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{i18n.t('home.classes')}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.count}</Text>
                    </View>
                </View>
            );
        }
        if (item.type === 'row') {
            return (
                <View style={styles.row}>
                    {item.items.map((cls, i) =>
                        cls ? (
                            <View key={cls.id} style={styles.cardWrapper}>
                                <ClassCard
                                    id={cls.id}
                                    name={cls.name}
                                    discipline={cls.discipline}
                                    startTime={cls.start_time}
                                    endTime={cls.end_time}
                                    instructor={cls.instructor ? `${cls.instructor.first_name} ${cls.instructor.last_name}` : 'Unknown Coach'}
                                    instructorAvatar={cls.instructor?.profile_picture ?? ''}
                                    capacity={cls.capacity}
                                    attendeeCount={cachedCounts[cls.id] || 0}
                                    onPress={() => router.push(`/class/${cls.id}`)}
                                />
                            </View>
                        ) : (
                            <View key={`empty-${i}`} style={styles.cardWrapper} />
                        )
                    )}
                </View>
            );
        }
        return null;
    };

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
            <FlatList
                data={listData}
                renderItem={renderItem}
                keyExtractor={(_, i) => `item-${i}`}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>{i18n.t('home.no_classes')}</Text>}
                ListFooterComponent={<View style={{ height: Spacing.xxxl }} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    content: { paddingHorizontal: Spacing.lg },
    headerContainer: {
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTextGroup: { gap: Spacing.xs },
    headerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface },
    headerAvatarPlaceholder: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface,
        alignItems: 'center', justifyContent: 'center'
    },
    headerAvatarInitial: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textMuted },
    dateText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textMuted, letterSpacing: 0.8 },
    welcomeTitle: { fontSize: Typography.xxl, fontWeight: Typography.heavy, color: Colors.text },
    heroPadding: { marginBottom: Spacing.xl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
    sectionTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.text },
    sectionCount: { fontSize: Typography.sm, color: Colors.textMuted },
    row: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
    cardWrapper: { flex: 1 },
    emptyText: {
        textAlign: 'center',
        padding: Spacing.xl,
        color: Colors.textMuted,
        fontSize: Typography.base,
    },
    badge: {
        backgroundColor: Colors.primary,
        borderRadius: Radii.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
    },
    badgeText: {
        color: Colors.primaryForeground,
        fontSize: Typography.sm,
        fontWeight: Typography.bold,
    },
});
