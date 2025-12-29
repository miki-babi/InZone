import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface StatsOverviewProps {
    streak: number;
    todayMinutes: number;
}

export default function StatsOverview({ streak, todayMinutes }: StatsOverviewProps) {
    return (
        <View className="flex-row justify-between mb-6">
            <View className="bg-white p-6 rounded-[32px] border border-gray-100 w-[48%] shadow-sm shadow-gray-200">
                <View className="w-10 h-10 rounded-2xl bg-orange-50 items-center justify-center mb-4">
                    <FontAwesome name="fire" size={20} color="#f97316" />
                </View>
                <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Streak</Text>
                <Text className="text-3xl font-extrabold text-gray-900">{streak}<Text className="text-sm font-medium text-gray-400"> days</Text></Text>
            </View>

            <View className="bg-white p-6 rounded-[32px] border border-gray-100 w-[48%] shadow-sm shadow-gray-200">
                <View className="w-10 h-10 rounded-2xl bg-indigo-50 items-center justify-center mb-4">
                    <FontAwesome name="clock-o" size={20} color="#4f46e5" />
                </View>
                <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">Today</Text>
                <Text className="text-3xl font-extrabold text-gray-900">{todayMinutes}<Text className="text-sm font-medium text-gray-400"> mins</Text></Text>
            </View>
        </View>
    );
}
