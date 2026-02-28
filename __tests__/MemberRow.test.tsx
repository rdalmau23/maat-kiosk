import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { MemberRow } from '../components/MemberRow';

// Mock expo-google-fonts and custom Text to avoid font loading in tests
jest.mock('@expo-google-fonts/geist', () => ({
    useFonts: () => [true],
    Geist_400Regular: null,
    Geist_500Medium: null,
    Geist_600SemiBold: null,
    Geist_700Bold: null,
    Geist_900Black: null,
}));

jest.mock('../components/Text', () => {
    const { Text } = require('react-native');
    return { Text: ({ children, style }: any) => <Text style={style}>{children}</Text> };
});

const baseProps = {
    firstName: 'Ada',
    lastName: 'Lovelace',
};

describe('MemberRow', () => {
    it('renders the member full name', () => {
        render(<MemberRow {...baseProps} />);
        expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    });

    it('shows "Checked in" badge when status is checked-in', () => {
        render(<MemberRow {...baseProps} status="checked-in" />);
        expect(screen.getByText('Checked in')).toBeTruthy();
    });

    it('shows "Registered" badge when status is registered', () => {
        render(<MemberRow {...baseProps} status="registered" />);
        expect(screen.getByText('Registered')).toBeTruthy();
    });

    it('shows no status badge when status is undefined', () => {
        render(<MemberRow {...baseProps} />);
        expect(screen.queryByText('Checked in')).toBeNull();
        expect(screen.queryByText('Registered')).toBeNull();
        expect(screen.queryByText('Confirmed')).toBeNull();
    });

    it('displays the formatted check-in time when provided', () => {
        render(<MemberRow {...baseProps} registeredAt="09:30" />);
        expect(screen.getByText('09:30')).toBeTruthy();
    });
});
