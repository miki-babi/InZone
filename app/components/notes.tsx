import { FontAwesome } from '@expo/vector-icons';
import { format } from 'date-fns';
import { desc, eq } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, SectionList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { notesTable } from '../../db/schema';
import { addToTable, deleteFromTable, getFiltered, updateTable } from '../../lib/dbhelper';

export function NotesScreen() {
    const [items, setItems] = useState<typeof notesTable.$inferSelect[]>([]);
    const mode = 'goal'; // Force goal mode as requested
    const [modalVisible, setModalVisible] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const [newCategory, setNewCategory] = useState('General');
    const [shareCategory, setShareCategory] = useState<string | null>(null);
    const [shareGoal, setShareGoal] = useState<typeof notesTable.$inferSelect | null>(null);
    const viewShotRef = useRef(null);

    const fetchItems = async () => {
        try {
            const result = await getFiltered(
                notesTable,
                eq(notesTable.type, mode),
                [desc(notesTable.createdAt)]
            );
            setItems(result as any);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchItems();
        }, [mode])
    );

    // Trigger share when shareCategory or shareGoal is set
    React.useEffect(() => {
        if (shareCategory || shareGoal) {
            setTimeout(async () => {
                try {
                    if (viewShotRef.current) {
                        const uri = await captureRef(viewShotRef, { format: 'png', quality: 0.8 });
                        await Sharing.shareAsync(uri);
                    }
                } catch (e) {
                    Alert.alert('Error', 'Failed to share');
                } finally {
                    setShareCategory(null);
                    setShareGoal(null);
                }
            }, 100);
        }
    }, [shareCategory, shareGoal]);

    const addItem = async () => {
        if (!newItemText.trim()) return;
        try {
            await addToTable(notesTable, {
                title: newItemText.trim(),
                category: newCategory.trim() || 'General',
                type: mode,
                completed: false,
            });
            setNewItemText('');
            setNewCategory('General');
            setModalVisible(false);
            fetchItems();
        } catch (e) {
            Alert.alert('Error', 'Failed to save');
        }
    };

    const toggleComplete = async (id: number, currentStatus: boolean) => {
        try {
            await updateTable(notesTable, { completed: !currentStatus }, eq(notesTable.id, id));
            fetchItems();
        } catch (e) { console.error(e); }
    };

    const deleteItem = async (id: number) => {
        try {
            await deleteFromTable(notesTable, eq(notesTable.id, id));
            fetchItems();
        } catch (e) { console.error(e); }
    };


    const renderItem = ({ item }: { item: typeof notesTable.$inferSelect }) => (
        <TouchableOpacity className="flex-row items-center p-5 bg-white rounded-[24px] mb-3 border border-gray-100 shadow-sm" 
        onPress={() => toggleComplete(item.id, item.completed)}
        
           onLongPress={() => {
                                           Alert.alert('Delete Task', 'Remove this task?', [
                                               { text: 'Cancel', style: 'cancel' },
                                               { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) }
                                           ]);
                                       }}
        >
            <TouchableOpacity >
                <View className={`w-8 h-8 rounded-full border-2 items-center justify-center ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'
                    }`}>
                    {item.completed && <FontAwesome name="check" size={12} color="white" />}
                </View>
            </TouchableOpacity>

            <View className="flex-1 ml-4 bg-transparent">
                <Text className={`text-lg font-medium ${item.completed ? 'text-gray-300 line-through' : 'text-gray-800'}`}>
                    {item.title}
                </Text>
            </View>

            <View className="flex-row items-center">
                {/* <TouchableOpacity onPress={() => setShareGoal(item)} className="p-2 mr-1">
                    <FontAwesome name="share" size={16} color="#9ca3af" />
                </TouchableOpacity> */}
                <TouchableOpacity onPress={() => deleteItem(item.id)} className="p-2">
                    <FontAwesome name="trash-o" size={18} color="#f87171" style={{ opacity: 0.6 }} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    // Group items by category
    const sections = React.useMemo(() => {
        const groups: { [key: string]: typeof notesTable.$inferSelect[] } = {};
        items.forEach(item => {
            const cat = item.category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return Object.keys(groups).sort().map(key => ({
            title: key,
            data: groups[key]
        }));
    }, [items]);

    return (
        <View className="flex-1 bg-transparent mt-4"> 
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-3xl font-bold text-gray-900">Goals</Text>
                <TouchableOpacity
                    className="bg-emerald-500 p-3 rounded-full shadow-lg shadow-emerald-500/30"
                    onPress={() => setModalVisible(true)}
                >
                    <FontAwesome name="plus" size={18} color="white" />
                </TouchableOpacity>
            </View>

            {/* List */}
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }: { section: { title: string } }) => (
                    <View className="flex-row justify-between items-center mt-6 mb-3">
                        <View className="flex-row items-center">
                            <View className="w-2 h-6 bg-emerald-500 rounded-full mr-2" />
                            <Text className="text-xl font-bold text-gray-800">{title}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setShareCategory(title)}
                            className="bg-gray-100 p-2 rounded-lg"
                        >
                            <FontAwesome name="share" size={14} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text className="text-center text-gray-400 mt-20">No goals found.</Text>}
            />

            {/* Hidden Shareable View */}
            <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 1.0 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: -3000,
                    width: 1000,
                    backgroundColor: 'white',
                    padding: 80,
                    zIndex: -100,
                }}
            >


                {/* Content Section */}
                {shareGoal ? (
                    <View className="bg-gray-50 rounded-[48px] p-20 border border-gray-100 shadow-sm">
                        <View className="flex-row items-center mb-10">
                            <View className="px-6 py-2 bg-emerald-100 rounded-full mr-4">
                                <Text className="text-emerald-700 font-bold uppercase text-sm tracking-widest">{shareGoal.category || 'General'}</Text>
                            </View>
                            {shareGoal.completed && (
                                <View className="px-6 py-2 bg-emerald-500 rounded-full">
                                    <Text className="text-white font-bold uppercase text-sm tracking-widest">Completed</Text>
                                </View>
                            )}
                        </View>

                        <Text className={`text-7xl font-bold leading-[1.1] ${shareGoal.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {shareGoal.title}
                        </Text>

                        <View className="mt-20 flex-row items-center">
                            <View className="w-12 h-1 bg-emerald-500 rounded-full mr-6" />
                            <Text className="text-gray-400 font-medium text-xl italic">Target Objective Progress</Text>
                        </View>
                    </View>
                ) : (
                    <View>
                        <View className="mb-16">
                            {/* <Text className="text-gray-400 font-bold uppercase tracking-[10px] text-sm mb-4">Category Report</Text> */}
                            <Text className="text-7xl font-black text-gray-900">{shareCategory}</Text>
                        </View>

                        <View className="space-y-6">
                            {(items.filter(i => (i.category || 'General') === shareCategory)).map((item, idx) => (
                                <View key={item.id} className="flex-row items-center p-10 bg-gray-50 rounded-[32px] border border-gray-100 mb-4">
                                    <View className={`w-12 h-12 rounded-full border-4 items-center justify-center ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'}`}>
                                        {item.completed && <FontAwesome name="check" size={20} color="white" />}
                                    </View>
                                    <Text className={`flex-1 ml-8 text-3xl font-bold ${item.completed ? 'text-gray-300 line-through' : 'text-gray-800'}`}>
                                        {item.title}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Branding */}
                <View className="flex-row items-center justify-between mt-24 w-full">
                    <View className="flex-row items-center">

                        <View>
                            <Text className="text-black font-black text-6xl tracking-tighter">InZone</Text>
                            {/* <Text className="text-gray-400 font-bold uppercase tracking-[12px] text-xs mt-2">Personal Mastery</Text> */}
                        </View>
                    </View>
                    <View className="items-end">
                        <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">Authenticated Snapshot</Text>
                        <Text className="text-2xl font-black text-gray-900">{format(new Date(), 'MM.dd.yyyy')}</Text>
                    </View>
                </View>
            </ViewShot>

            {/* Add Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/40">
                    <KeyboardAvoidingView behavior="padding" className="bg-white rounded-t-[40px] p-8">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-bold text-gray-900">New Goal</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <FontAwesome name="times-circle" size={24} color="#d1d5db" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            className="bg-gray-50 p-5 rounded-2xl text-lg font-medium border border-gray-100 mb-4"
                            placeholder="Category (e.g. Work, Health)"
                            value={newCategory}
                            onChangeText={setNewCategory}
                        />

                        <TextInput
                            className="bg-gray-50 p-5 rounded-2xl text-lg font-medium border border-gray-100 mb-6 h-32"
                            placeholder="What is your goal?"
                            multiline
                            value={newItemText}
                            onChangeText={setNewItemText}
                            textAlignVertical="top"
                            autoFocus
                        />
                        <TouchableOpacity
                            className="bg-emerald-500 p-5 rounded-2xl items-center shadow-lg shadow-emerald-500/30"
                            onPress={addItem}
                        >
                            <Text className="text-white font-bold text-lg">Add Goal</Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </View>
    );
}
