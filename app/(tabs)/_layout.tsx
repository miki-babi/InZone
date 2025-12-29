import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#10B981', // indigo-600
                tabBarInactiveTintColor: '#9ca3af', // gray-400
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                },
            }}>

            <Tabs.Screen
                name="index"
                options={{
                    title: '',
                    tabBarIcon: ({ color }) => <FontAwesome name="check-square-o" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="focus"
                options={{
                    title: '',
                    tabBarIcon: ({ color }) => <FontAwesome name="clock-o" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: ' ',
                    tabBarIcon: ({ color }) => <FontAwesome name="bar-chart" size={24} color={color} />,
                }}
            />

        </Tabs>
    );
}
