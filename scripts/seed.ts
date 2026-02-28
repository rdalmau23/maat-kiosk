/**
 * ONE-TIME SEED SCRIPT — already executed, not needed to run the app.
 *
 * This script was used to populate the Supabase database with the initial
 * data from data/members.json and data/classes.json.
 * The database is already seeded at https://nxnkniyzteqwmdpqiovz.supabase.co
 *
 * To re-seed: npx tsx scripts/seed.ts
 */
import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';
import membersData from '../data/members.json';
import classesData from '../data/classes.json';

const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

async function seed() {
    console.log('🌱 Seeding Supabase...\n');

    // 1. Members
    console.log('→ Inserting members...');
    const members = membersData.map((m) => ({
        id: m.id,
        first_name: m.firstName,
        last_name: m.lastName,
        profile_picture: m.profilePicture,
    }));
    const { error: membersError } = await supabase
        .from('members')
        .upsert(members, { onConflict: 'id' });
    if (membersError) { console.error('❌ members:', membersError.message); process.exit(1); }
    console.log(`   ✅ ${members.length} members inserted`);

    // 2. Classes
    console.log('→ Inserting classes...');
    const classes = classesData.map((c) => ({
        id: c.id,
        name: c.name,
        discipline: c.discipline,
        start_time: c.startTime,
        end_time: c.endTime,
        instructor: c.instructor,
        instructor_avatar: c.instructorAvatar,
        capacity: c.capacity,
        banner_image: c.bannerImage,
    }));
    const { error: classesError } = await supabase
        .from('classes')
        .upsert(classes, { onConflict: 'id' });
    if (classesError) { console.error('❌ classes:', classesError.message); process.exit(1); }
    console.log(`   ✅ ${classes.length} classes inserted`);

    // 3. Attendees
    console.log('→ Inserting attendees...');
    const attendees = classesData.flatMap((c) =>
        c.attendees.map((a) => ({
            class_id: c.id,
            member_id: a.memberId,
            status: a.status,
            registered_at: a.registeredAt,
        }))
    );
    await supabase.from('attendees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: attendeesError } = await supabase.from('attendees').insert(attendees);
    if (attendeesError) { console.error('❌ attendees:', attendeesError.message); process.exit(1); }
    console.log(`   ✅ ${attendees.length} attendees inserted`);

    console.log('\n🎉 Seed complete!');
}

seed().catch(console.error);
