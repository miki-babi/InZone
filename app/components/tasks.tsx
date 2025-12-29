import { FontAwesome } from '@expo/vector-icons';
import { desc, eq } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { taskTable } from '../../db/schema';
import { addToTable, deleteFromTable, getFiltered, updateTable } from '../../lib/dbhelper';

export function TasksScreen() {
    const [tasks, setTasks] = useState<typeof taskTable.$inferSelect[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const fetchTasks = async () => {
        try {
            const result = await getFiltered(taskTable, undefined, [desc(taskTable.createdAt)]);
            setTasks(result as any);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [])
    );

    const addTask = async () => {
        if (!newTaskTitle.trim()) return;
        try {
            await addToTable(taskTable, {
                title: newTaskTitle.trim(),
                completed: false,
            });
            setNewTaskTitle('');
            setModalVisible(false);
            fetchTasks();
        } catch (e) {
            Alert.alert('Error', 'Failed to add task');
        }
    };

    const toggleTask = async (id: number, currentStatus: boolean) => {
        try {
            await updateTable(taskTable, { completed: !currentStatus }, eq(taskTable.id, id));
            fetchTasks();
        } catch (e) {
            console.error(e);
        }
    };

    const deleteTask = async (id: number) => {
        try {
            await deleteFromTable(taskTable, eq(taskTable.id, id));
            fetchTasks();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <View className="flex-1">
            <View className="flex-row items-center justify-between mb-6">
                <Text className="text-3xl font-bold text-gray-900">Tasks</Text>
                <TouchableOpacity
                    className="bg-emerald-500 p-3 rounded-full shadow-lg shadow-emerald-600/30"
                    onPress={() => setModalVisible(true)}
                >
                    <FontAwesome name="plus" size={18} color="white" />
                </TouchableOpacity>
            </View>

            <View className="flex-row flex-1">
                {/* Task Cards */}
                <ScrollView
                    className="flex-1 pr-4"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {tasks.length === 0 ? (
                        <View className="items-center justify-center mt-10">
                            <FontAwesome name="clipboard" size={48} color="#f3f4f6" />
                            <Text className="text-gray-300 mt-2 font-medium">No tasks yet.</Text>
                        </View>
                    ) : (
                        tasks.map((item) => (
                            <View key={item.id} className="mb-4 pt-5">
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    className={`flex-row items-center p-2 rounded-[28px] border ${item.completed
                                        ? 'bg-emerald-50/50 border-emerald-100'
                                        : 'bg-white border-gray-100 shadow-sm'
                                        }`}
                                    onPress={() => toggleTask(item.id, item.completed)}
                                    onLongPress={() => {
                                        Alert.alert('Delete Task', 'Remove this task?', [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Delete', style: 'destructive', onPress: () => deleteTask(item.id) }
                                        ]);
                                    }}
                                >
                                    <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${item.completed ? 'bg-indigo-100' : 'bg-gray-50'
                                        }`}>
                                        <Text className="text-xl">📝</Text>
                                    </View>
                                    <View className="flex-1 mr-2">
                                        <Text
                                            className={`text-lg font-semibold ${item.completed ? "text-indigo-900/40 line-through" : "text-gray-800"
                                                }`}
                                        >
                                            {item.title}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert('Delete Task', 'Remove this task?', [
                                                { text: 'Cancel', style: 'cancel' },
                                                { text: 'Delete', style: 'destructive', onPress: () => deleteTask(item.id) }
                                            ]);
                                        }}
                                        className="p-2"
                                    >
                                        <FontAwesome name="trash-o" size={18} color="#f87171" style={{ opacity: 0.6 }} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ScrollView>

                {/* Timeline Path */}
                <View className="w-10 items-center">
                    <View className="absolute top-4 bottom-0 w-[2px] bg-gray-100" />
                    {tasks.map((task, index) => (
                        <View key={task.id} className="h-[88px] justify-center items-center">
                            <View className={`w-7 h-7 rounded-full border-2 items-center justify-center z-10 ${task.completed
                                ? 'bg-emerald-500 border-emerald-600'
                                : 'bg-white border-gray-200'
                                }`}>
                                {task.completed && (
                                    <FontAwesome name="check" size={12} color="white" />
                                )}
                            </View>

                            {/* Connector line for completed chain */}
                            {task.completed && index < tasks.length - 1 && tasks[index + 1].completed && (
                                <View className="absolute top-1/2 bottom-0 w-[2px] bg-emerald-500" />
                            )}
                            {task.completed && index > 0 && tasks[index - 1].completed && (
                                <View className="absolute top-0 bottom-1/2 w-[2px] bg-emerald-500" />
                            )}
                        </View>
                    ))}
                </View>
            </View>

            {/* Modal remains functional */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/40">
                    <KeyboardAvoidingView behavior="padding" className="bg-white rounded-t-[40px] p-8">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-gray-900">New Task</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <FontAwesome name="times-circle" size={24} color="#d1d5db" />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            className="bg-gray-50 p-5 rounded-2xl text-lg font-medium border border-gray-100 mb-6"
                            placeholder="What needs to be done?"
                            value={newTaskTitle}
                            onChangeText={setNewTaskTitle}
                            autoFocus
                        />
                        <TouchableOpacity
                            className="bg-emerald-500 p-5 rounded-2xl items-center shadow-lg shadow-emerald-600/30"
                            onPress={addTask}
                        >
                            <Text className="text-white font-bold text-lg">Add Task</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}
