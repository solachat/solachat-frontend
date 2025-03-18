import * as React from 'react';
import Badge from '@mui/joy/Badge';
import Avatar, { AvatarProps } from '@mui/joy/Avatar';

type AvatarWithStatusProps = AvatarProps & {
    online?: boolean;
};

export default function AvatarWithStatus(props: AvatarWithStatusProps) {
    const { online = false, ...other } = props;

    if (!online) {
        return <Avatar size="sm" {...other} />;
    }

    return (
        <Badge
            color="success"
            variant="solid"
            size="sm"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeInset="6px 6px"
            sx={{
                '& .JoyBadge-badge': {
                    backgroundColor: '#4caf50',
                    transform: 'translate(-25%, -25%)',
                    border: '2px solid #fff',
                },
            }}
        >
            <Avatar size="sm" {...other} />
        </Badge>
    );
}
