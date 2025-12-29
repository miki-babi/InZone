import { sql } from "drizzle-orm";
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import * as SQLite from 'expo-sqlite';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { db, sqliteDb } from '../db/client';
import migrations from '../drizzle/migrations';
import '../global.css';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);

  useEffect(() => {
    // console.log("Migration State:", { success, error });
    if (migrations.migrations && migrations.migrations.m0000) {
      // console.log("Migration 0000 SQL Content:", migrations.migrations.m0000); // Log the content!
    } else {
      // console.error("Migration 0000 NOT FOUND in migrations object");
    }
    if (error) {
      console.error("Migration Error Details:", JSON.stringify(error, null, 2));
    }
    if (success) {
      SplashScreen.hideAsync();

      // DEBUG: Check if tables really exist
      (async () => {
        try {
          const result = await db.all(
            sql`SELECT name FROM sqlite_master WHERE type='table';`
          );
          // console.log("Existing Tables:", JSON.stringify(result, null, 2));

          // AUTO-FIX: If we have users_table but not task_table, we are in a stale state.
          const tableNames = result.map((r: any) => r.name);
          if (tableNames.includes('users_table') && !tableNames.includes('task_table')) {
            // console.error("STALE DATABASE DETECTED! Deleting database and reloading...");
            sqliteDb.closeSync();
            await SQLite.deleteDatabaseAsync('app.db');
            throw new Error("Stale Database Detected. Database has been deleted. PLEASE RELOAD THE APP.");
          }

        } catch (e) {
          console.error("Failed to check tables or reset DB:", e);
        }
      })();
    }

    if (error) {
      SplashScreen.hideAsync();
      console.error("Migration Error Details:", JSON.stringify(error, null, 2));
    }
  }, [success, error]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-red-50">
        <Text className="text-red-500 font-bold">Migration Error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
