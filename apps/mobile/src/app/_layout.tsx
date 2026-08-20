import { Stack } from 'expo-router'; import { StatusBar } from 'expo-status-bar'; import { QueryProvider } from '../providers/QueryProvider';
export default function RootLayout() { return <QueryProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F7F6F2' } }} /></QueryProvider>; }
