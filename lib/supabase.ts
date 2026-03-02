import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://nxnkniyzteqwmdpqiovz.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54bmtuaXl6dGVxd21kcHFpb3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTEyMzcsImV4cCI6MjA4Nzg2NzIzN30.l_7sd_QfxiSuh-aEUxJzO--0MsfidlmpTww7iWS3-8I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
