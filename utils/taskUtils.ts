import { eq } from "drizzle-orm";
import { Alert } from "react-native";
import { taskTable } from "../db/schema";
import { addToTable, deleteFromTable, updateTable } from "../lib/dbhelper";

// Add task
export const addTask = async (title: string) => {
  if (!title.trim()) return;
  try {
    await addToTable(taskTable, { title: title.trim(), completed: false });
  } catch (e) {
    Alert.alert("Error", "Failed to add task");
  }
};

// Toggle task completed
export const toggleTask = async (id: number, currentStatus: boolean) => {
  try {

    await updateTable(
      taskTable,
      { completed: !currentStatus },
      eq(taskTable.id, id)
    );
  } catch (e) {
    Alert.alert("Error", "Failed to update task");
  }
};

// Delete task
export const deleteTask = async (id: number) => {
  try {
    await deleteFromTable(taskTable, eq(taskTable.id, id));
  } catch (e) {
    Alert.alert("Error", "Failed to delete task");
  }
};
