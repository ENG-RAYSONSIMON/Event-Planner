import { db } from "../../config/db";
import { RegisterBody, LoginBody } from "./auth.types";
import { hashPassword, comparePassword } from "../../shared/utils/password";
import { generateToken } from "../../shared/utils/jwt";
import { HttpError } from "../../shared/utils/httpError";

interface UserRow {
    id: number;
    full_name: string;
    email: string;
    password: string;
}

export const registerUser = async (body: RegisterBody) => {
    const { fullName, email, password } = body;

    const existingUsersResult = await db.query<UserRow>(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (existingUsersResult.rows.length > 0) {
        throw new HttpError(409, "Email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const result = await db.query<{ id: number }>(
        "INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id",
        [fullName, email, hashedPassword]
    );

    return {
        id: result.rows[0].id,
        fullName,
        email
    };
};

export const loginUser = async (body: LoginBody) => {
    const { email, password } = body;

    const usersResult = await db.query<UserRow>(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (usersResult.rows.length === 0) {
        throw new HttpError(401, "Invalid email or password");
    }

    const user = usersResult.rows[0];

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
