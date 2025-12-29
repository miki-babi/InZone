import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import "../../global.css";
import { NotesScreen } from '../components/notes';
import { TasksScreen } from '../components/tasks';

export default function Home() {
    const [activeTab, setActiveTab] = useState<'tasks' | 'goals'>('tasks');

    return (
        <View className="flex-1 bg-white pt-10 px-6">
            {/* Minimalistic Toggle */}
            <View className="flex-row justify-center mb-6">
                <View className="bg-gray-100 p-1 rounded-2xl flex-row w-64">
                    <TouchableOpacity
                        onPress={() => setActiveTab('tasks')}
                        className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'tasks' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${activeTab === 'tasks' ? 'text-emerald-600' : 'text-gray-400'}`}>Tasks</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('goals')}
                        className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'goals' ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${activeTab === 'goals' ? 'text-emerald-600' : 'text-gray-400'}`}>Goals</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1">
                {activeTab === 'tasks' ? (
                    <TasksScreen />
                ) : (
                    <NotesScreen />
                )}
            </View>
        </View>
    );
}
