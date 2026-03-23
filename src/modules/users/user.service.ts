import { db } from "../../config/db";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
    id: number;
    full_name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

export const fetchAllUsers = async () => {
    const [users] = await db.query<UserRow[]>(
        "SELECT id, full_name, email, created_at, updated_at FROM users ORDER BY id DESC"
    );

    return users;
};

export const fetchUserById = async (id: number) => {
    const [users] = await db.query<UserRow[]>(
        "SELECT id, full_name, email, created_at, updated_at FROM users WHERE id = ?",
        [id]
    );

    return users[0] || null;
};