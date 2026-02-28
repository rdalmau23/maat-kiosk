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
import { Colors, Spacing, Typography } from '@/constants/theme';
import { ClassCard } from '@/components/ClassCard';
import { HeroBanner } from '@/components/HeroBanner';
import { fetchClasses, fetchAttendeeCounts, type Class } from '@/lib/api';

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
    const [classes, setClasses] = useState<Class[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const [data, attendeeCounts] = await Promise.all([
                fetchClasses(),
                fetchAttendeeCounts(),
            ]);
            setClasses(data);
            setCounts(attendeeCounts);
        } catch (e) {
            console.error('Failed to load classes:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onRefresh = () => { setRefreshing(true); load(); };

    const today = new Date()
        .toLocaleDateString('en-US', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
        })
        .toUpperCase();

    const listData: ListItem[] = React.useMemo(() => {
        if (loading) return [{ type: 'header' }, { type: 'hero' }];
        const rows = pairItems(classes);
        return [
            { type: 'header' },
            { type: 'hero' },
            { type: 'section', count: classes.length },
            ...rows.map((items) => ({ type: 'row' as const, items })),
        ];
    }, [classes, loading]);

    const renderItem: ListRenderItem<ListItem> = ({ item }) => {
        if (item.type === 'header') {
            return (
                <View style={styles.headerContainer}>
                    <Text style={styles.dateText}>{today}</Text>
                    <Text style={styles.welcomeTitle}>Welcome to MAAT</Text>
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
                    <Text style={styles.sectionTitle}>Today's classes</Text>
                    <Text style={styles.sectionCount}>{item.count} classes</Text>
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
                                    instructor={cls.instructor}
                                    instructorAvatar={cls.instructor_avatar ?? ''}
                                    capacity={cls.capacity}
                                    attendeeCount={counts[cls.id] ?? 0}
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
                keyExtractor={(_, i) => String(i)}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListFooterComponent={<View style={{ height: Spacing.xxxl }} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    content: { paddingHorizontal: Spacing.lg },
    headerContainer: { paddingTop: Spacing.xl, paddingBottom: Spacing.md, gap: Spacing.xs },
    dateText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.textMuted, letterSpacing: 0.8 },
    welcomeTitle: { fontSize: Typography.xxl, fontWeight: Typography.heavy, color: Colors.text },
    heroPadding: { marginBottom: Spacing.xl },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
    sectionTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.text },
    sectionCount: { fontSize: Typography.sm, color: Colors.textMuted },
    row: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
    cardWrapper: { flex: 1 },
});
