import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://zjfqyyplvtouqvlbtskh.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZnF5eXBsdnRvdXF2bGJ0c2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODYxNjMsImV4cCI6MjA4Nzk2MjE2M30.pQj5-hm1nRhc0zD82M2JJ2clT-UXtNJSLMNAThcTC0Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
