import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Member } from '@/lib/api';

type AuthState = {
    session: Session | null;
    user: User | null;
    profile: Member | null;
    initialized: boolean;
    setSession: (session: Session | null) => Promise<void>;
    initialize: () => void;
    signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    profile: null,
    initialized: false,

    setSession: async (session) => {
        if (!session) {
            set({ session: null, user: null, profile: null, initialized: true });
            return;
        }

        // Fetch the user's explicit profile (and role) from the backend
        const { data: profile } = await supabase
            .from('members')
            .select('*')
            .eq('id', session.user.id)
            .single();

        set({
            session,
            user: session.user,
            profile: profile as AuthState['profile'],
            initialized: true
        });
    },

    initialize: () => {
        // Run once on app startup to attempt restoration
        supabase.auth.getSession().then(({ data: { session } }) => {
            useAuthStore.getState().setSession(session);
        });

        // Listen globally to any login/logout events (even from other tabs)
        supabase.auth.onAuthStateChange((_event, session) => {
            useAuthStore.getState().setSession(session);
        });
    },

    signOut: async () => {
        await supabase.auth.signOut();
    },
}));
