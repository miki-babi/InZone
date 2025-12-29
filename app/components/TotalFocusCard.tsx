import React from 'react';
import { Text, View } from 'react-native';

interface TotalFocusCardProps {
    totalMinutes: number;
}

export default function TotalFocusCard({ totalMinutes }: TotalFocusCardProps) {
    return (
        <View className="bg-emerald-500 p-8 rounded-[32px] shadow-2xl shadow-emerald-500/30 mb-8">
            <Text className="text-emerald-50 font-bold uppercase tracking-widest text-[10px] mb-2">Total Focus Time</Text>
            <Text className="text-5xl font-extrabold text-white tracking-tighter">
                {Math.floor(totalMinutes / 60)}h <Text className="text-2xl opacity-80">{totalMinutes % 60}m</Text>
            </Text>
        </View>
    );
}
