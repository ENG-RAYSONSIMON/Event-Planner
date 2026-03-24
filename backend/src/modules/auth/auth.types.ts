export interface RegisterBody {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface JwtPayload {
    userId: number;
    email: string;
}