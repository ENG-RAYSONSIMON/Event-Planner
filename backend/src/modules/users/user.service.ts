import { db } from "../../config/db";

interface UserRow {
    id: number;
    full_name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}

export const fetchAllUsers = async () => {
    const usersResult = await db.query<UserRow>(
        "SELECT id, full_name, email, created_at, updated_at FROM users ORDER BY id DESC"
    );

    return usersResult.rows;
};

export const fetchUserById = async (id: number) => {
    const usersResult = await db.query<UserRow>(
        "SELECT id, full_name, email, created_at, updated_at FROM users WHERE id = $1",
        [id]
    );

    return usersResult.rows[0] || null;
};
