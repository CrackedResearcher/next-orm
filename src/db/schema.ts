import { integer, pgTable, time, uuid, varchar,  } from "drizzle-orm/pg-core";

export const userTable = pgTable("userData", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: time("createdAt").defaultNow(),
})

export const fileTable = pgTable("userFiles", {
    id: uuid("id").defaultRandom().primaryKey(), 
    fileName: varchar("file_name", { length: 255 }).notNull(),
    uploadedAt: time("file_uploaded_at").defaultNow(),
    userId: uuid("user_id").references(() => userTable.id, { onDelete: "cascade", onUpdate: "cascade" }).notNull()
})

