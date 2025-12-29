import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface WeeklyProgressChartProps {
    data: { day: string; minutes: number }[];
    onShare?: () => void;
    width?: number;
}

export default function WeeklyProgressChart({ data, onShare, width }: WeeklyProgressChartProps) {
    const chartWidth = width || Dimensions.get("window").width - 80;

    return (
        <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm shadow-gray-100 mb-6 items-center">
            <View className="flex-row justify-between w-full mb-6 items-center px-2">
                <View className="flex-row items-center">
                    <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Weekly Progress</Text>
                    <View className="flex-row items-center ml-4">
                        <View className="w-2 h-2 rounded-full bg-indigo-600 mr-2" />
                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">Minutes</Text>
                    </View>
                </View>
                {onShare && (
                    <TouchableOpacity onPress={onShare} className="p-2 -mr-2">
                        <FontAwesome name="share-alt" size={14} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>
            <LineChart
                data={{
                    labels: data.map(d => d.day),
                    datasets: [{ data: data.map(d => d.minutes) }]
                }}
                width={chartWidth}
                height={200}
                yAxisSuffix="m"
                chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                    propsForDots: { r: "4", strokeWidth: "2", stroke: "#4f46e5" },
                    propsForBackgroundLines: {
                        strokeDasharray: "",
                        stroke: "#f3f4f6",
                    },
                }}
                bezier
                style={{ borderRadius: 16 }}
            />
        </View>
    );
}
