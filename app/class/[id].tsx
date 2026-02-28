import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    ListRenderItem,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Colors, Spacing, Typography, Radii } from '@/constants/theme';
import { MemberRow, MemberStatus } from '@/components/MemberRow';
import { TagBadge } from '@/components/TagBadge';
import {
    fetchClass,
    fetchClassAttendees,
    fetchCheckIns,
    type Class,
    type Attendee,
    type CheckIn,
} from '@/lib/api';

type AttendeeRow = {
    memberId: string;
    status: MemberStatus;
    registeredAt?: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
};

export default function ClassScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [cls, setCls] = useState<Class | null>(null);
    const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        if (!id) return;
        try {
            const [classData, attendeeData, checkInData] = await Promise.all([
                fetchClass(id),
                fetchClassAttendees(id),
                fetchCheckIns(id),
            ]);
            setCls(classData);

            // Merge: check-ins first (most recent), then pre-registered attendees
            const checkedInIds = new Set(checkInData.map((ci) => ci.member_id));

            const checkInRows: AttendeeRow[] = checkInData.map((ci) => ({
                memberId: ci.member_id,
                status: 'checked-in' as MemberStatus,
                registeredAt: ci.checked_in_at,
                firstName: ci.member?.first_name ?? '',
                lastName: ci.member?.last_name ?? '',
                profilePicture: ci.member?.profile_picture ?? undefined,
            }));

            const attendeeRows: AttendeeRow[] = attendeeData
                .filter((a) => !checkedInIds.has(a.member_id))
                .map((a) => ({
                    memberId: a.member_id,
                    status: a.status as MemberStatus,
                    registeredAt: a.registered_at ?? undefined,
                    firstName: (a as any).member?.first_name ?? '',
                    lastName: (a as any).member?.last_name ?? '',
                    profilePicture: (a as any).member?.profile_picture ?? undefined,
                }));

            setAttendees([...checkInRows, ...attendeeRows]);
        } catch (e) {
            console.error('Failed to load class:', e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Reload when navigating back (after check-in)
    useEffect(() => { load(); }, [load]);

    type ListItem =
        | { type: 'header' }
        | { type: 'attendee' } & AttendeeRow;

    const listData: ListItem[] = useMemo(() => [
        { type: 'header' },
        ...attendees.map((a) => ({ type: 'attendee' as const, ...a })),
    ], [attendees]);

    const renderItem: ListRenderItem<ListItem> = ({ item }) => {
        if (item.type === 'header') {
            if (!cls) return null;
            return (
                <View style={styles.classInfo}>
                    <View style={styles.classRow}>
                        <TagBadge discipline={cls.discipline} />
                    </View>
                    <Text style={styles.className}>{cls.name}</Text>
                    <View style={styles.metaRow}>
                        <Feather name="clock" size={14} color={Colors.textSecondary} />
                        <Text style={styles.metaText}>{cls.start_time} – {cls.end_time}</Text>
                        <Feather name="user" size={14} color={Colors.textSecondary} />
                        <Text style={styles.metaText}>{cls.instructor}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Feather name="users" size={14} color={Colors.textSecondary} />
                        <Text style={styles.metaText}>{attendees.length} / {cls.capacity} attendees</Text>
                    </View>
                    <View style={styles.sectionLabel}>
                        <Text style={styles.sectionTitle}>Attendees</Text>
                    </View>
                </View>
            );
        }
        if (item.type === 'attendee') {
            const canCheckIn = item.status !== 'checked-in';
            return (
                <MemberRow
                    firstName={item.firstName}
                    lastName={item.lastName}
                    profilePicture={item.profilePicture}
                    status={item.status}
                    registeredAt={item.registeredAt}
                    showChevron={canCheckIn}
                    onPress={canCheckIn ? () => router.push({
                        pathname: `/class/${id}/checkin`,
                        params: {
                            memberId: item.memberId,
                            memberName: `${item.firstName} ${item.lastName}`,
                            memberAvatar: item.profilePicture ?? '',
                        },
                    }) : undefined}
                />
            );
        }
        return null;
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Feather name="arrow-left" size={22} color={Colors.text} />
                    </TouchableOpacity>
                </View>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Feather name="arrow-left" size={22} color={Colors.text} />
                </TouchableOpacity>
                {cls?.instructor_avatar ? (
                    <Image source={{ uri: cls.instructor_avatar }} style={styles.instrAvatar} />
                ) : null}
            </View>

            <FlatList
                data={listData}
                renderItem={renderItem}
                keyExtractor={(item, i) => item.type === 'attendee' ? item.memberId : `header-${i}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={styles.emptyText}>No attendees yet.</Text>}
                ListFooterComponent={<View style={{ height: 100 }} />}
            />

            <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.fab}
                    onPress={() => router.push(`/class/${id}/search`)} activeOpacity={0.85}>
                    <Feather name="user-plus" size={20} color={Colors.primaryForeground} />
                    <Text style={styles.fabText}>Add Check-In</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
    backBtn: { padding: Spacing.sm },
    instrAvatar: { width: 36, height: 36, borderRadius: Radii.full, backgroundColor: Colors.surface },
    listContent: { paddingBottom: Spacing.xl },
    classInfo: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, gap: Spacing.sm },
    classRow: { flexDirection: 'row', gap: Spacing.sm },
    className: { fontSize: Typography.xxl, fontWeight: Typography.heavy, color: Colors.text, marginTop: Spacing.xs },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    metaText: { fontSize: Typography.sm, color: Colors.textSecondary },
    sectionLabel: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.lg, marginTop: Spacing.md },
    sectionTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.text },
    emptyText: { padding: Spacing.xl, textAlign: 'center', color: Colors.textMuted, fontSize: Typography.base },
    fabContainer: { position: 'absolute', bottom: 40, left: Spacing.xl, right: Spacing.xl },
    fab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radii.full, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl },
    fabText: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.primaryForeground },
});
