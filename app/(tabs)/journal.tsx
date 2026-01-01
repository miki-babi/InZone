import { deleteFromTable } from '@/lib/dbhelper';
import { FontAwesome } from '@expo/vector-icons';
import { eq } from 'drizzle-orm';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../db/client';
import { voiceJournalTable } from '../../db/schema';

export default function JournalScreen() {
  /* ================= Recorder ================= */
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  /* ================= Playback state ================= */
  const [currentUri, setCurrentUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const player = useAudioPlayer(
    currentUri ? { uri: currentUri } : null
  );

  /* ================= UI / DB ================= */
  const [entries, setEntries] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [showSave, setShowSave] = useState(false);

  const loadEntries = async () => {
    const rows = await db.select().from(voiceJournalTable);
    setEntries(rows.reverse());
  };

  /* ================= Recording ================= */
  const startRecording = async () => {
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const pauseRecording = async () => {
    await recorder.pause();
  };

  const resumeRecording = async () => {
    await recorder.record();
  };

  const stopRecording = async () => {
    await recorder.stop();
    setShowSave(true);
  };

  const saveRecording = async () => {
    if (!recorder.uri) return;

    await db.insert(voiceJournalTable).values({
      filePath: recorder.uri,
      category: category || 'General',
      recordedAt: new Date(),
    });

    setCategory('');
    setShowSave(false);
    loadEntries();
  };

  /* ================= Playback ================= */
  const togglePlayback = (uri: string) => {
    // Same recording → play / pause
    if (currentUri === uri) {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
      return;
    }

    // Different recording → pause + reset old
    if (isPlaying) {
      player.pause();
      player.seekTo(0);
    }

    setCurrentUri(uri);
    setIsPlaying(true);
  };

  /* ================= Permissions ================= */
  useEffect(() => {
    (async () => {
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Microphone permission required');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      loadEntries();
    })();
  }, []);

  /* ================= Group by Date ================= */
  const sections = useMemo(() => {
    return entries.reduce((acc: any[], item) => {
      const date = new Date(item.recordedAt).toLocaleDateString();
      const section = acc.find((s) => s.title === date);

      if (section) section.data.push(item);
      else acc.push({ title: date, data: [item] });

      return acc;
    }, []);
  }, [entries]);


  const deleteItem = async (id: number) => {
          try {
              await deleteFromTable(voiceJournalTable, eq(voiceJournalTable.id, id));
    loadEntries();
              
          } catch (e) {
              console.error(e);
          }
      };

  /* ================= UI ================= */
  return (
    <View className="flex-1 bg-white px-5 pt-14">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-3xl font-bold text-gray-900">Voice Journal</Text>

        <TouchableOpacity
          className="bg-emerald-500 p-3 rounded-full shadow-lg shadow-emerald-500/30"
          onPress={recorderState.isRecording ? stopRecording : startRecording}
        >
          <FontAwesome
            name={recorderState.isRecording ? 'stop' : 'microphone'}
            size={18}
            color="white"
          />
        </TouchableOpacity>
      </View>

      {/* Recording controls */}
      {recorderState.isRecording && (
        <View className="flex-row justify-center gap-6 mb-6">
          <TouchableOpacity
            className="bg-gray-100 px-6 py-3 rounded-xl"
            onPress={recorderState.isPaused ? resumeRecording : pauseRecording}
          >
            <Text className="font-bold text-gray-800">
              {recorderState.isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Recordings list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderSectionHeader={({ section: { title } }) => (
          <View className="flex-row items-center mt-6 mb-3">
            <View className="w-2 h-6 bg-emerald-500 rounded-full mr-2" />
            <Text className="text-xl font-bold text-gray-800">{title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const active = currentUri === item.filePath && isPlaying;

          return (
            <TouchableOpacity
              onPress={() => togglePlayback(item.filePath)}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-3"

             onLongPress={() => {
                                                         Alert.alert('Delete Task', 'Remove this task?', [
                                                             { text: 'Cancel', style: 'cancel' },
                                                             { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) }
                                                         ]);
                                                     }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-gray-900">
                  {item.category}
                </Text>

                <FontAwesome
                  name={active ? 'pause' : 'play'}
                  size={14}
                  color="#10b981"
                />
              </View>

              <Text className="text-gray-400 text-sm mt-1">
                Tap to listen
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Save modal */}
      <Modal visible={showSave} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white p-6 rounded-t-3xl">
            <TextInput
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
              className="border border-gray-200 rounded-xl p-4 mb-4"
              autoFocus
            />

            <TouchableOpacity
              className="bg-emerald-500 p-4 rounded-xl items-center mb-3"
              onPress={saveRecording}
            >
              <Text className="text-white font-bold">Save Recording</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center"
              onPress={() => setShowSave(false)}
            >
              <Text className="text-gray-400 font-bold">Discard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
