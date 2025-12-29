import { format } from 'date-fns';
import React from 'react';
import { Text, View } from 'react-native';

interface RecentSessionsListProps {
    sessions: any[]; // Or properly typed if possible
}

export default function RecentSessionsList({ sessions }: RecentSessionsListProps) {
    if (sessions.length === 0) return null;

    return (
        <View className="px-2 mb-28">
            <Text className="text-gray-400 font-bold uppercase tracking-widest text-[11px] mb-6">Recent Sessions</Text>
            {sessions.map(s => (
                <View
                    key={s.id}
                    className="flex-row items-center justify-between mb-4 bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm shadow-gray-100"
                >
                    <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center mr-4">
                            <Text className="text-2xl">{s.mood || '😐'}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>{s.title}</Text>
                            <Text className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{s.createdAt ? format(s.createdAt, 'MMM d, h:mm a') : ''}</Text>
                        </View>
                    </View>
                    <View className="bg-indigo-50 px-4 py-2 rounded-2xl">
                        <Text className="font-extrabold text-indigo-600 text-xs">{Math.round(s.duration / 60)}m</Text>
                    </View>
                </View>
            ))}
        </View>
    );
}
