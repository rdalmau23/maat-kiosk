import { supabase } from './supabase';



export type Member = {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture: string | null;
};

export type Class = {
    id: string;
    name: string;
    discipline: string;
    start_time: string;
    end_time: string;
    instructor: string;
    instructor_avatar: string | null;
    capacity: number;
    banner_image: string | null;
};

export type Attendee = {
    id: string;
    class_id: string;
    member_id: string;
    status: string;
    registered_at: string | null;
    member?: Member;
};

export type CheckIn = {
    id: string;
    class_id: string;
    member_id: string;
    checked_in_at: string;
    member?: Member;
};



export async function fetchClasses(): Promise<Class[]> {

    const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('start_time')
        .limit(20);
    if (error) throw error;
    return data ?? [];
}

// Returns a map of classId → total attendee count (pre-registered + checked-in)
export async function fetchAttendeeCounts(): Promise<Record<string, number>> {
    const [{ data: attendees }, { data: checkIns }] = await Promise.all([
        supabase.from('attendees').select('class_id'),
        supabase.from('check_ins').select('class_id, member_id'),
    ]);

    const counts: Record<string, number> = {};

    for (const a of attendees ?? []) {
        counts[a.class_id] = (counts[a.class_id] ?? 0) + 1;
    }

    for (const ci of checkIns ?? []) {
        counts[ci.class_id] = (counts[ci.class_id] ?? 0) + 1;
    }

    return counts;
}



export async function fetchClass(id: string): Promise<Class | null> {
    const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', id)
        .single();
    if (error) return null;
    return data;
}



export async function fetchMembers(): Promise<Member[]> {
    const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('last_name');
    if (error) throw error;
    return data ?? [];
}



export async function fetchClassAttendees(classId: string): Promise<Attendee[]> {
    const { data, error } = await supabase
        .from('attendees')
        .select('*, member:members(*)')
        .eq('class_id', classId);
    if (error) throw error;
    return data ?? [];
}



export async function fetchCheckIns(classId: string): Promise<CheckIn[]> {
    const { data, error } = await supabase
        .from('check_ins')
        .select('*, member:members(*)')
        .eq('class_id', classId)
        .order('checked_in_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
}

export async function insertCheckIn(classId: string, memberId: string): Promise<void> {
    const { error } = await supabase
        .from('check_ins')
        .insert({ class_id: classId, member_id: memberId });
    if (error) throw error;
}

export async function deleteCheckIn(classId: string, memberId: string): Promise<void> {
    const { error } = await supabase
        .from('check_ins')
        .delete()
        .eq('class_id', classId)
        .eq('member_id', memberId);
    if (error) throw error;
}

export async function isMemberCheckedIn(classId: string, memberId: string): Promise<boolean> {
    const { count, error } = await supabase
        .from('check_ins')
        .select('id', { count: 'exact', head: true })
        .eq('class_id', classId)
        .eq('member_id', memberId);
    if (error) return false;
    return (count ?? 0) > 0;
}
