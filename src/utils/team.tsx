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
        name: 'Maxim Nikola',
        position: 'Chief Architect',
        description: 'SolaChat Platform',
        avatar: '/img/avatars/yataknemogy.jpg'
    },
];
