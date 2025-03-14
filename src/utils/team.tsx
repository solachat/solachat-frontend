// utils/team.ts

export interface TeamMember {
    id: number;
    name: string;
    position: string;
    description: string;
    avatar: string;
}

export const teamMembers: TeamMember[] = [
    {
        id: 1,
        name: 'yataknemogy',
        position: 'Chief Architect',
        description: 'DarkChat Platform',
        avatar: '/img/avatars/yataknemogy.jpg'
    },
];
