import { db } from "../../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { RegisterBody, LoginBody } from "./auth.types";
import { hashPassword, comparePassword } from "../../shared/utils/password";
import { generateToken } from "../../shared/utils/jwt";
import { HttpError } from "../../shared/utils/httpError";

interface UserRow extends RowDataPacket {
    id: number;
    full_name: string;
    email: string;
    password: string;
}

export const registerUser = async (body: RegisterBody) => {
    const { fullName, email, password } = body;

    const [existingUsers] = await db.query<UserRow[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    if (existingUsers.length > 0) {
        throw new HttpError(409, "Email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const [result] = await db.execute<ResultSetHeader>(
        "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
        [fullName, email, hashedPassword]
    );

    return {
        id: result.insertId,
        fullName,
        email
    };
};

export const loginUser = async (body: LoginBody) => {
    const { email, password } = body;

    const [users] = await db.query<UserRow[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
    );

    if (users.length === 0) {
        throw new HttpError(401, "Invalid email or password");
    }

    const user = users[0];

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
        throw new HttpError(401, "Invalid email or password");
    }

    const token = generateToken({
        userId: user.id,
        email: user.email
    });

    return {
        token,
        user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email
        }
    };
};
