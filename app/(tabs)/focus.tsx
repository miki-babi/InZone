import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../db/client';
import { focusSessionTable } from '../../db/schema';

export default function FocusScreen() {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const intervalRef = useRef<any>(null);

    // Modal State
    const [sessionTitle, setSessionTitle] = useState('');
    const [mood, setMood] = useState('🚀');

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else if (!isActive && intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const stopTimer = () => {
        setIsActive(false);
        setShowSaveModal(true);
    };

    const saveSession = async () => {
        try {
            await db.insert(focusSessionTable).values({
                title: sessionTitle || 'Focus Session',
                duration: seconds,
                mood: mood,
            });
            setShowSaveModal(false);
            setSeconds(0);
            setSessionTitle('');
            Alert.alert('Success', 'Focus session saved!');
        } catch (e) {
            Alert.alert('Error', 'Failed to save session');
        }
    };

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const navigation = useNavigation();

    useEffect(() => {
        if (isActive) {
            navigation.setOptions({
                tabBarStyle: { display: 'none' },
                headerShown: false,
            });
        } else {
            navigation.setOptions({
                tabBarStyle: {
                    display: 'flex',
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                },
                headerShown: false, // Keep it false for consistent premium look
            });
        }
    }, [isActive, navigation]);

    return (
        <View className={`flex-1 px-8 items-center justify-center ${isActive ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Header Info */}
            {!isActive && (
                <View className="absolute top-12 left-8 right-8">
                    <Text className="text-4xl font-extrabold text-gray-900 tracking-tight">Focus</Text>
                    <Text className="text-gray-400 mt-2 font-medium">Step into your deepest flow.</Text>
                </View>
            )}

            {/* Timer Ring */}
            <View className={`w-80 h-80 rounded-[80px] items-center justify-center border-[2px] ${isActive ? 'bg-gray-800/50 border-emerald-500/50' : 'bg-white border-gray-100 shadow-xl shadow-gray-200'
                }`}>
                <View className="items-center">
                    <Text className={`text-7xl font-light tracking-tighter ${isActive ? 'text-white' : 'text-gray-900'}`}>
                        {formatTime(seconds)}
                    </Text>
                    <View className={`mt-4 px-4 py-1 rounded-full ${isActive ? 'bg-emerald-500/10' : 'bg-gray-50'}`}>
                        <Text className={`font-bold tracking-[4px] uppercase text-[10px] ${isActive ? 'text-emerald-500' : 'text-gray-300'}`}>
                            {isActive ? 'In the Zone' : 'Ready'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Controls */}
            <View className="absolute bottom-20 items-center w-full px-8">
                <View className="flex-row items-center gap-6">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        className={`w-28 h-28 rounded-full items-center justify-center shadow-2xl ${isActive
                            ? 'bg-white shadow-white/20'
                            : 'bg-emerald-500 shadow-emerald-500/40'
                            }`}
                        onPress={toggleTimer}
                    >
                        <FontAwesome
                            name={isActive ? "pause" : "play"}
                            size={32}
                            color={isActive ? "#111827" : "white"}
                            style={!isActive ? { marginLeft: 4 } : {}}
                        />
                    </TouchableOpacity>

                    {seconds > 0 && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className="w-20 h-20 rounded-full items-center justify-center bg-gray-100 border border-gray-200"
                            onPress={stopTimer}
                        >
                            <FontAwesome name="stop" size={24} color="#111827" />
                        </TouchableOpacity>
                    )}
                </View>

                {isActive && (
                    <Text className="text-gray-500 mt-8 font-medium italic opacity-60">Focusing is a superpower.</Text>
                )}
            </View>

            {/* Save Modal */}
            <Modal
                visible={showSaveModal}
                animationType="slide"
                transparent={true}
            >
                <View className="flex-1 justify-end bg-black/40">
                    <KeyboardAvoidingView behavior="padding" className="bg-white rounded-t-[40px] p-10">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-3xl font-bold text-gray-900">Well Done</Text>
                            <TouchableOpacity onPress={() => { setShowSaveModal(false); setSeconds(0); }}>
                                <FontAwesome name="times-circle" size={28} color="#f3f4f6" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-400 mb-4 font-bold uppercase tracking-widest text-[10px]">What did you focus on?</Text>
                        <TextInput
                            className="bg-gray-50 p-6 rounded-2xl text-xl font-semibold border border-gray-100 mb-8"
                            placeholder="Reading, Design, etc."
                            value={sessionTitle}
                            onChangeText={setSessionTitle}
                            autoFocus
                        />

                        <Text className="text-gray-400 mb-4 font-bold uppercase tracking-widest text-[10px]">How do you feel now?</Text>
                        <View className="flex-row justify-between mb-10 px-2">
                            {['🚀', '🙂', '😐', '😵‍💫', '🤯'].map((m) => (
                                <TouchableOpacity
                                    key={m}
                                    onPress={() => setMood(m)}
                                    className={`w-14 h-14 rounded-2xl items-center justify-center ${mood === m ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'bg-gray-50'
                                        }`}
                                >
                                    <Text className="text-3xl">{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            className="bg-emerald-500 p-6 rounded-3xl items-center shadow-2xl shadow-emerald-500/40"
                            onPress={saveSession}
                        >
                            <Text className="text-white font-bold text-xl">Log Session</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="mt-6 py-4 items-center"
                            onPress={() => { setShowSaveModal(false); setSeconds(0); }}
                        >
                            <Text className="text-gray-300 font-bold tracking-widest uppercase text-xs">Discard Progress</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}
