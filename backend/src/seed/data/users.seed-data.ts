// src/seed/data/user.seed-data.ts

import { UserRoleEnum } from 'src/common/enum/global.enum';

export const usersSeed = [
    {
        username: 'admin',
        email: 'admin@admin.dev.cm',
        password: 'Admin123!',
        firstName: 'System',
        lastName: 'Administrator',
        phone: '650000000',
        role: UserRoleEnum.ADMIN,
        regionId: null,
    },
    {
        username: 'viewer1',
        email: 'viewer1@example.com',
        password: 'Viewer123!',
        firstName: 'John',
        lastName: 'Viewer',
        phone: '651111111',
        role: UserRoleEnum.VIEWER,
        regionId: null,
    },
];

// {
//     "username": "admin",
//     "password": "Admin123!"
// }
