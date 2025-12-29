import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface SessionTrendsChartProps {
    labels: string[];
    datasets: any[];
    onShare?: () => void;
    width?: number;
}

export default function SessionTrendsChart({ labels, datasets, onShare, width }: SessionTrendsChartProps) {
    const chartWidth = width || Math.max(Dimensions.get("window").width - 80, labels.length * 50);

    return (
        <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm shadow-gray-100 mb-6">
            <View className="flex-row justify-between w-full mb-6 items-center">
                <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Session Trends</Text>
                {onShare && (
                    <TouchableOpacity onPress={onShare} className="p-2 -mr-2">
                        <FontAwesome name="share-alt" size={14} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                    data={{
                        labels: labels,
                        datasets: datasets
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
                            strokeDasharray: "", // solid background lines
                            stroke: "#f3f4f6",
                        },
                        useShadowColorFromDataset: true
                    }}
                    bezier
                    style={{ borderRadius: 16 }}
                />
            </ScrollView>
        </View>
    );
}
