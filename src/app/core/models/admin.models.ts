export type ManagerRole = 'ROLE_SUPER_MANAGER' | 'ROLE_TRIP_MANAGER' | 'ROLE_BUS_MANAGER';

export interface AdminCreate{
    username: string;
    password: string;
    name: string;
    email: string;
    phone: string;
    role: ManagerRole
}

export interface AdminProfileResponse {
    username: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    busServiceProvider: string;
}

export interface AdminProfileUpdate {
    name: string;
    email: string;
    phone: string;
}