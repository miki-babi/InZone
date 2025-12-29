import { FontAwesome } from '@expo/vector-icons';
import { format } from 'date-fns';
import { desc } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { db } from '../../db/client';
import { focusSessionTable } from '../../db/schema';
import {
    calculateAnalyticsStats,
    ChartDataItem,
    FocusSession,
    getInitialChartData,
    prepareTopicDistributionData,
    prepareTrendChartData
} from '../../utils/analyticsUtils';

// Components
import RecentSessionsList from '../components/RecentSessionsList';
import SessionTrendsChart from '../components/SessionTrendsChart';
import StatsOverview from '../components/StatsOverview';
import TopicDistributionChart from '../components/TopicDistributionChart';
import TotalFocusCard from '../components/TotalFocusCard';
import WeeklyProgressChart from '../components/WeeklyProgressChart';

export default function AnalyticsScreen() {
    const [sessions, setSessions] = useState<FocusSession[]>([]);
    const [stats, setStats] = useState({ totalMinutes: 0, streak: 0, todayMinutes: 0 });
    const [chartData, setChartData] = useState<ChartDataItem[]>(getInitialChartData());
    const [recentSessions, setRecentSessions] = useState<FocusSession[]>([]);

    const viewShotRef = useRef(null);
    const wideReportRef = useRef(null);
    const weeklyRef = useRef(null);
    const trendsRef = useRef(null);
    const topicsRef = useRef(null);

    const fetchStats = async () => {
        try {
            const allSessions = await db.select().from(focusSessionTable).orderBy(desc(focusSessionTable.createdAt));
            setRecentSessions(allSessions.slice(0, 3));
            setSessions(allSessions);
            const { stats, weeklyChartData } = calculateAnalyticsStats(allSessions);
            setStats(stats);
            setChartData(weeklyChartData);
        } catch (e) {
            console.error(e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    const shareNode = async (ref: any) => {
        try {
            if (ref.current) {
                const uri = await captureRef(ref, {
                    format: 'png',
                    quality: 0.8,
                    result: 'tmpfile'
                });
                await Sharing.shareAsync(uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to share');
        }
    };

    const { chartLabels, datasets } = prepareTrendChartData(sessions);
    const pieData = prepareTopicDistributionData(sessions);

    return (
        <View className="flex-1 bg-white pt-10">
            <ScrollView className="flex-1 pt-12 px-8" showsVerticalScrollIndicator={false}>
                <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }} style={{ backgroundColor: 'white' }}>
                    {/* Header */}
                    <View className="mb-10">
                        <Text className="text-4xl font-extrabold text-gray-900 tracking-tight">Progress</Text>
                        <Text className="text-gray-400 mt-2 font-medium">Your journey summarized.</Text>
                    </View>

                    {/* Stats */}
                    <StatsOverview streak={stats.streak} todayMinutes={stats.todayMinutes} />
                    <TotalFocusCard totalMinutes={stats.totalMinutes} />

                    {/* Charts */}
                    <ViewShot ref={weeklyRef} options={{ format: "png", quality: 0.9 }} style={{ backgroundColor: 'white' }}>
                        <WeeklyProgressChart data={chartData} onShare={() => shareNode(weeklyRef)} />
                    </ViewShot>

                    <ViewShot ref={trendsRef} options={{ format: "png", quality: 0.9 }} style={{ backgroundColor: 'white' }}>
                        <SessionTrendsChart labels={chartLabels} datasets={datasets} onShare={() => shareNode(trendsRef)} />
                    </ViewShot>

                    <ViewShot ref={topicsRef} options={{ format: "png", quality: 0.9 }} style={{ backgroundColor: 'white' }}>
                        <TopicDistributionChart data={pieData} onShare={() => shareNode(topicsRef)} />
                    </ViewShot>
                </ViewShot>

                {/* List - Excluded from main ViewShot */}
                <RecentSessionsList sessions={recentSessions} />
            </ScrollView>

            {/* Share Button Floating */}
            {/* <View className="absolute bottom-10 left-8 right-8">
                <TouchableOpacity
                    activeOpacity={0.9}
                    className="bg-gray-900 p-6 rounded-3xl flex-row items-center justify-center shadow-2xl shadow-black/20"
                    onPress={() => shareNode(wideReportRef)}
                >
                    <FontAwesome name="share" size={18} color="white" />
                    <Text className="text-white font-bold text-lg ml-4 tracking-tight">Share Wide Report</Text>
                </TouchableOpacity>
            </View> */}

            {/* Hidden Wide Shareable View */}
            <ViewShot
                ref={wideReportRef}
                options={{ format: "png", quality: 1.0 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: -2000,
                    width: 1000,
                    backgroundColor: 'white',
                    padding: 60,
                }}
            >
                {/* Stats Row - Premium Big Cards */}
                <View className="flex-row justify-between mb-12">
                    {/* Card 1: Streak */}
                    <View className="bg-gray-50 p-10 rounded-[48px] border border-gray-100 w-[31%] shadow-sm shadow-gray-200">
                        <View className="w-16 h-16 rounded-3xl bg-white items-center justify-center mb-6 shadow-sm shadow-gray-200">
                            <FontAwesome name="fire" size={32} color="#f97316" />
                        </View>
                        <Text className="text-3xl font-extrabold text-gray-900 mb-2">{stats.streak}<Text className="text-lg font-normal text-gray-400"> d</Text></Text>
                        <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Current Streak</Text>
                    </View>

                    {/* Card 2: Today */}
                    <View className="bg-gray-50 p-10 rounded-[48px] border border-gray-100 w-[31%] shadow-sm shadow-gray-200">
                        <View className="w-16 h-16 rounded-3xl bg-white items-center justify-center mb-6 shadow-sm shadow-gray-200">
                            <FontAwesome name="calendar" size={28} color="#4f46e5" />
                        </View>
                        <Text className="text-3xl font-extrabold text-gray-900 mb-2">{stats.todayMinutes}<Text className="text-lg font-normal text-gray-400"> m</Text></Text>
                        <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Today's Focus</Text>
                    </View>

                    {/* Card 3: Total */}
                    <View className="bg-emerald-500 p-10 rounded-[48px] shadow-2xl shadow-emerald-500/30 w-[31%] shadow-emerald-500/20">
                        <View className="w-16 h-16 rounded-3xl bg-white/20 items-center justify-center mb-6">
                            <FontAwesome name="clock-o" size={28} color="white" />
                        </View>
                        <Text className="text-3xl font-extrabold text-white mb-2">{Math.round(stats.totalMinutes / 60)}<Text className="text-lg font-normal text-emerald-100"> h</Text></Text>
                        <Text className="text-emerald-100 font-bold uppercase tracking-widest text-[10px]">Lifetime Total</Text>
                    </View>
                </View>

                {/* Line Charts Row */}
                <View className="flex-row justify-between mb-12">
                    <View className="w-[49%]">
                        <WeeklyProgressChart data={chartData} width={430} />
                    </View>
                    <View className="w-[49%]">
                        <SessionTrendsChart labels={chartLabels} datasets={datasets} width={430} />
                    </View>
                </View>

                {/* Pie Chart Row */}
                <View className="w-full bg-white p-12 rounded-[56px] border border-gray-100 items-center shadow-lg shadow-gray-100">
                    <TopicDistributionChart data={pieData} width={880} />
                </View>

                <View className="mt-16 border-t border-gray-100 pt-12 items-center">
                    <Text className="text-gray-300 font-bold tracking-[14px] uppercase text-xs">
                        STATE OF MIND • CAPTURED BY INZONE • {format(new Date(), 'MMMM yyyy')}
                    </Text>
                </View>
            </ViewShot>
        </View>
    );
}

