import { Stack, useSegments, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {
    useFonts,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_900Black,
} from '@expo-google-fonts/geist';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/useAuthStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Geist_400Regular,
        Geist_500Medium,
        Geist_600SemiBold,
        Geist_700Bold,
        Geist_900Black,
    });

    const { session, initialized, initialize } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (fontsLoaded && initialized) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, initialized]);

    useEffect(() => {
        if (!initialized || !fontsLoaded) return;

        const inAuthGroup = segments[0] === 'login';

        if (!session && !inAuthGroup) {
            // Redirect to the login page.
            router.replace('/login');
        } else if (session && inAuthGroup) {
            // Redirect away from the login page.
            router.replace('/');
        }
    }, [session, initialized, segments, fontsLoaded]);

    if (!fontsLoaded || !initialized) return null;

    return (
        <>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.background },
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="login" options={{ animation: 'fade' }} />
                <Stack.Screen name="index" />
                <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
                <Stack.Screen name="class/[id]" />
                <Stack.Screen
                    name="class/[id]/search"
                    options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
                />
                <Stack.Screen
                    name="class/[id]/checkin"
                    options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
                />
            </Stack>
        </>
    );
}
