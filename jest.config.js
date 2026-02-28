/** @type {import('jest').Config} */
module.exports = {
    projects: [
        // Pure TypeScript unit tests — no React Native, no Expo runtime
        {
            displayName: 'unit',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
            transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react' } }] },
            moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
        },
        // React Native component tests — uses jest-expo preset
        {
            displayName: 'components',
            preset: 'jest-expo',
            testMatch: ['<rootDir>/__tests__/**/*.test.tsx'],
            transformIgnorePatterns: [
                'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/.*|native-base|react-native-svg)',
            ],
        },
    ],
};
