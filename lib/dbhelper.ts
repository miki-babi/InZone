import { InferInsertModel, SQL, Table } from "drizzle-orm";
import { db } from "../db/client";

export async function getAll<T extends Table>(table: T) {
    return db.select().from(table);
}


export async function addToTable<T extends Table>(
    table: T,
    values: InferInsertModel<T>
) {
    return db.insert(table).values(values);
}


export async function updateTable<T extends Table>(
    table: T,
    values: Partial<InferInsertModel<T>>,
    where: SQL
) {
    return db.update(table).set(values).where(where);
}

export async function deleteFromTable<T extends Table>(
    table: T,
    where: SQL
) {
    return db.delete(table).where(where);
}

export async function getById<T extends Table>(
    table: T,
    where: SQL
) {
    const result = await db.select().from(table).where(where);
    return result[0] ?? null; // return null if not found
}

export async function getFiltered<T extends Table>(
    table: T,
    where?: SQL,
    orderBy?: SQL | SQL[]
) {
    let query = db.select().from(table);
    if (where) {
        query = query.where(where) as any;
    }
    if (orderBy) {
        query = query.orderBy(...(Array.isArray(orderBy) ? orderBy : [orderBy])) as any;
    }
    return query;
}