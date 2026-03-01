/**
 * SEED SCRIPT FOR AUTH & RBAC (Feature Branch)
 *
 * Requirements:
 * 1. You MUST have EXPO_PUBLIC_SUPABASE_URL in your .env
 * 2. You MUST have SUPABASE_SERVICE_ROLE_KEY in your .env (Not the Anon key!)
 *    - You can find the Service Role Key in Supabase -> Project Settings -> API.
 * 3. Disable "Confirm Email" in Supabase -> Authentication -> Providers -> Email.
 */
import { config } from 'dotenv';
config();

import { createClient } from '@supabase/supabase-js';
import membersData from '../data/members.json';
import classesData from '../data/classes.json';

// We need the SERVICE ROLE KEY to bypass Auth RLS and create users dynamically
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function seed() {
    console.log('🌱 Seeding Supabase with Auth Users...\n');

    // 1. Create Users
    console.log('→ Creating auth.users and generating profiles...');
    const userMap = new Map<string, string>(); // Maps raw JSON ID to real Auth UUID

    for (const m of membersData) {
        // We use Admin API to securely create users without needing them to click email confirmations
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: m.email,
            password: 'password123', // Default dev password
            email_confirm: true,
            user_metadata: {
                first_name: m.firstName,
                last_name: m.lastName,
                profile_picture: m.profilePicture,
            }
        });

        let newUserId: string;

        if (authError && authError.message.includes('already been registered')) {
            // Fetch the existing user UUID from the members table by matching first/last name
            // (In a real app, you'd fetch by email using admin.listUsers)
            const { data: adminUsers } = await supabase.auth.admin.listUsers();
            const existingUser = adminUsers?.users.find(u => u.email === m.email);
            if (!existingUser) continue;
            newUserId = existingUser.id;
        } else if (authError || !authData.user) {
            console.error(`❌ Failed to create auth user ${m.email}:`, authError?.message);
            continue;
        } else {
            newUserId = authData.user.id;
        }

        userMap.set(m.id, newUserId);

        // The Postgres Trigger automatically creates the `members` row.
        // We just need to update it with the correct Role because the trigger defaults to 'member'.
        await supabase
            .from('members')
            .update({ role: m.role })
            .eq('id', newUserId);

        console.log(`   ✅ Created ${m.firstName} (${m.role}) -> ${newUserId}`);
    }

    // 2. Create Classes
    console.log('\n→ Inserting classes...');
    const todayDate = new Date().toISOString().split('T')[0];
    const classes = classesData.map((c) => {
        // Find the real UUID of the instructor we just created
        const realInstructorId = userMap.get(c.instructorId);

        return {
            name: c.name,
            discipline: c.discipline,
            start_time: `${todayDate}T${c.startTime}:00.000Z`,
            end_time: `${todayDate}T${c.endTime}:00.000Z`,
            instructor_id: realInstructorId,
            capacity: c.capacity,
        };
    });

    const { data: insertedClasses, error: classesError } = await supabase
        .from('classes')
        .insert(classes)
        .select('id, name'); // We need the new UUIDs to link attendees

    if (classesError || !insertedClasses) {
        console.error('❌ classes:', classesError?.message);
        process.exit(1);
    }
    console.log(`   ✅ ${insertedClasses.length} classes inserted`);

    // 3. Create Attendees
    console.log('\n→ Inserting attendees...');
    const attendeesToInsert: any[] = [];

    // Erase old attendees if any
    await supabase.from('attendees').delete().neq('id', 0); // Hack to clear table

    for (const cData of classesData) {
        // Find the Supabase UUID for this class
        const sbClass = insertedClasses.find(c => c.name === cData.name);
        if (!sbClass) continue;

        for (const a of cData.attendees) {
            const realMemberId = userMap.get(a.memberId);
            if (!realMemberId) continue;

            attendeesToInsert.push({
                class_id: sbClass.id,
                member_id: realMemberId,
                status: a.status,
                registered_at: `${todayDate}T${a.registeredAt}:00.000Z`
            });
        }
    }

    if (attendeesToInsert.length > 0) {
        const { error: attendeesError } = await supabase.from('attendees').insert(attendeesToInsert);
        if (attendeesError) {
            console.error('❌ attendees:', attendeesError.message);
            process.exit(1);
        }
        console.log(`   ✅ ${attendeesToInsert.length} attendees inserted`);
    }

    console.log('\n🎉 Seeding complete! You can now log into the app with the generated emails and password "password123".');
}

seed().catch(console.error);
