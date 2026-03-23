export interface User {
    id: number;
    full_name: string;
    email: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}

export interface PublicUser {
    id: number;
    full_name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
}