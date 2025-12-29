import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

interface TopicDistributionChartProps {
    data: {
        name: string;
        population: number;
        color: string;
        legendFontColor: string;
        legendFontSize: number;
    }[];
}

interface TopicDistributionChartProps {
    data: {
        name: string;
        population: number;
        color: string;
        legendFontColor: string;
        legendFontSize: number;
    }[];
    onShare?: () => void;
    width?: number;
}

export default function TopicDistributionChart({ data, onShare, width }: TopicDistributionChartProps) {
    const chartWidth = width || Dimensions.get("window").width - 80;

    return (
        <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm shadow-gray-100 mb-6">
            <View className="flex-row justify-between w-full mb-4 items-center">
                <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Topic Distribution</Text>
                {onShare && (
                    <TouchableOpacity onPress={onShare} className="p-2 -mr-2">
                        <FontAwesome name="share-alt" size={14} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>

            <PieChart
                data={data}
                width={chartWidth}
                height={200}
                chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                center={[10, 0]}
                absolute
            />
        </View>
    );
}
