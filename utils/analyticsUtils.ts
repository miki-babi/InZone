import { format, isSameDay, subDays } from 'date-fns';
import { focusSessionTable } from '../db/schema';

export type FocusSession = typeof focusSessionTable.$inferSelect;

export interface AnalyticsStats {
    totalMinutes: number;
    streak: number;
    todayMinutes: number;
}

export interface ChartDataItem {
    day: string;
    minutes: number;
    fullDate?: string;
}

export const getInitialChartData = (): ChartDataItem[] => {
    return Array.from({ length: 7 }).map((_, i) => ({
        day: format(subDays(new Date(), 6 - i), 'EEE'),
        minutes: 0
    }));
};

export const calculateAnalyticsStats = (data: FocusSession[]) => {
    let totalSecs = 0;
    let todaySecs = 0;
    const now = new Date();

    // 1. Total & Today
    data.forEach(s => {
        totalSecs += s.duration;
        if (s.createdAt && isSameDay(s.createdAt, now)) {
            todaySecs += s.duration;
        }
    });

    // 2. Streak
    const daysWithSessions = new Set(
        data
            .map(s => s.createdAt ? format(s.createdAt, 'yyyy-MM-dd') : null)
            .filter((d): d is string => !!d)
    );

    let currentStreak = 0;
    let streakDate = now;
    while (true) {
        const dayStr = format(streakDate, 'yyyy-MM-dd');
        if (daysWithSessions.has(dayStr)) {
            currentStreak++;
            streakDate = subDays(streakDate, 1);
        } else {
            if (isSameDay(streakDate, now)) {
                streakDate = subDays(streakDate, 1);
                continue; // Check yesterday
            }
            break;
        }
    }

    // 3. Chart Data (Last 7 Days)
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(now, 6 - i));
    const weeklyChartData: ChartDataItem[] = last7Days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const daySecs = data
            .filter(s => s.createdAt && isSameDay(s.createdAt, day))
            .reduce((acc, curr) => acc + curr.duration, 0);
        return {
            day: format(day, 'EEE'), // Mon ...
            minutes: Math.round(daySecs / 60),
            fullDate: dayStr
        };
    });

    return {
        stats: {
            totalMinutes: Math.round(totalSecs / 60),
            todayMinutes: Math.round(todaySecs / 60),
            streak: currentStreak
        },
        weeklyChartData
    };
};

export const COLORS = [
    (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
    (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
    (opacity = 1) => `rgba(255, 206, 86, ${opacity})`,
    (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
    (opacity = 1) => `rgba(153, 102, 255, ${opacity})`,
    (opacity = 1) => `rgba(255, 159, 64, ${opacity})`,
];

export const prepareTrendChartData = (sessions: FocusSession[]) => {
    // 1. Get all dates from sessions, sorted chronologically
    const allDates = Array.from(
        new Set(sessions.map(s => s.createdAt ? format(s.createdAt, 'yyyy-MM-dd') : null))
    )
        .filter((d): d is string => !!d)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // If no data, show empty chart or current day
    const chartLabels = allDates.length > 0 ? allDates.map(d => format(new Date(d), 'MMM d')) : [format(new Date(), 'MMM d')];
    const chartDates = allDates.length > 0 ? allDates : [format(new Date(), 'yyyy-MM-dd')];

    // 2. Get unique session titles
    const uniqueTitles = Array.from(new Set(sessions.map(s => s.title)));

    // 3. Build datasets
    const datasets = uniqueTitles.map((title, index) => {
        const data = chartDates.map(dateStr => {
            const totalDurationOnDate = sessions
                .filter(s => s.title === title && s.createdAt && format(s.createdAt, 'yyyy-MM-dd') === dateStr)
                .reduce((sum, s) => sum + s.duration, 0);

            return Math.round(totalDurationOnDate / 60); // Return minutes
        });

        const colorFn = COLORS[index % COLORS.length];

        return {
            data,
            color: colorFn,
            strokeWidth: 2,
            legend: title
        };
    });

    // Fallback if no data
    if (datasets.length === 0) {
        datasets.push({
            data: [0],
            color: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`,
            strokeWidth: 2,
            legend: "No Data"
        });
    }

    return { chartLabels, datasets };
};

export const prepareTopicDistributionData = (sessions: FocusSession[]) => {
    const uniqueTitles = Array.from(new Set(sessions.map(s => s.title)));

    return uniqueTitles.map((title, index) => {
        const totalMinutes = sessions
            .filter(s => s.title === title)
            .reduce((sum, s) => sum + s.duration, 0) / 60;

        return {
            name: title,
            population: Math.round(totalMinutes),
            color: COLORS[index % COLORS.length](1),
            legendFontColor: "#7F7F7F",
            legendFontSize: 12
        };
    }).filter(d => d.population > 0);
};
