import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Class, Member } from '@/lib/api';

interface CacheState {
    classes: Class[];
    counts: Record<string, number>;
    members: Member[];
    setClassesData: (classes: Class[], counts: Record<string, number>) => void;
    setMembers: (members: Member[]) => void;
}

export const useCacheStore = create<CacheState>()(
    persist(
        (set) => ({
            classes: [],
            counts: {},
            members: [],
            setClassesData: (classes, counts) => set({ classes, counts }),
            setMembers: (members) => set({ members }),
        }),
        {
            name: 'maat-kiosk-cache',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
