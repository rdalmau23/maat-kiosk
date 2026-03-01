import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Colors, Spacing, Typography, Radii } from '@/constants/theme';
import { SearchBar } from '@/components/SearchBar';
import { MemberRow, type MemberStatus } from '@/components/MemberRow';
import { fetchMembers, fetchCheckIns, fetchClassAttendees, type Member } from '@/lib/api';
import { useCacheStore } from '@/store/useCacheStore';
import { useAuthStore } from '@/store/useAuthStore';
import i18n from '@/lib/i18n';

export default function SearchScreen() {
    const { id: classId } = useLocalSearchParams<{ id: string }>();
    const { members: cachedMembers, setMembers: setCachedMembers } = useCacheStore();
    const { profile } = useAuthStore();

    // Hard block standard members from accessing search
    const isCoachOrAdmin = profile?.role === 'admin' || profile?.role === 'coach';

    const [members, setLocalMembers] = useState<Member[]>(cachedMembers);
    const [checkedInIds, setCheckedInIds] = useState<Set<string>>(new Set());
    const [attendeeStatus, setAttendeeStatus] = useState<Record<string, MemberStatus>>({});
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isCoachOrAdmin) {
            router.back();
        }
    }, [isCoachOrAdmin]);

    const load = useCallback(async () => {
        if (!classId) return;
        try {
            const [allMembers, checkIns, attendees] = await Promise.all([
                fetchMembers(),
                fetchCheckIns(classId),
                fetchClassAttendees(classId),
            ]);
            setCachedMembers(allMembers);
            setLocalMembers(allMembers);
            setCheckedInIds(new Set(checkIns.map((ci) => ci.member_id)));
            // Map member_id → their status for this class
            const statusMap: Record<string, MemberStatus> = {};
            for (const a of attendees) statusMap[a.member_id] = a.status as MemberStatus;
            setAttendeeStatus(statusMap);
        } catch (e) {
            console.error('Failed to load members:', e);
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    const filtered = query.trim()
        ? members.filter((m) =>
            `${m.first_name} ${m.last_name}`.toLowerCase().includes(query.toLowerCase())
        )
        : members;

    const handleSelect = (member: Member) => {
        const isCheckedIn = checkedInIds.has(member.id);
        router.push({
            pathname: `/class/${classId}/checkin`,
            params: {
                memberId: member.id,
                memberName: `${member.first_name} ${member.last_name}`,
                memberAvatar: member.profile_picture ?? '',
                isCheckedIn: isCheckedIn ? 'true' : 'false',
            },
        });
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
            <View style={styles.header}>
                <Text style={styles.title}>{i18n.t('checkin.find_member')}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                    <Feather name="x" size={22} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder={i18n.t('checkin.search_placeholder')}
                autoFocus
            />

            <FlatList
                data={filtered}
                keyExtractor={(m) => m.id}
                renderItem={({ item }) => {
                    const alreadyIn = checkedInIds.has(item.id);
                    // Only show a status badge if the member is related to this class
                    const status: MemberStatus | undefined = alreadyIn
                        ? 'checked-in'
                        : attendeeStatus[item.id];
                    return (
                        <TouchableOpacity
                            onPress={() => !alreadyIn && handleSelect(item)}
                            disabled={alreadyIn}
                            activeOpacity={alreadyIn ? 1 : 0.7}
                            style={alreadyIn ? styles.disabledRow : undefined}
                        >
                            <MemberRow
                                firstName={item.first_name}
                                lastName={item.last_name}
                                profilePicture={item.profile_picture ?? undefined}
                                status={status}
                                showChevron={true}
                            />
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Feather name="search" size={40} color={Colors.textMuted} />
                        <Text style={styles.emptyText}>No members found</Text>
                    </View>
                }
                keyboardShouldPersistTaps="handled"
                ListFooterComponent={<View style={{ height: Spacing.xxl }} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
    title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.text },
    closeBtn: { padding: Spacing.sm },
    disabledRow: { opacity: 0.4 },
    emptyState: { alignItems: 'center', paddingTop: Spacing.xxxl, gap: Spacing.md },
    emptyText: { fontSize: Typography.base, color: Colors.textMuted },
});
