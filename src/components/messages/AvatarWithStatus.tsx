import * as React from 'react';
import Badge from '@mui/joy/Badge';
import Avatar, { AvatarProps } from '@mui/joy/Avatar';

type AvatarWithStatusProps = AvatarProps & {
    online?: boolean;
};

export default function AvatarWithStatus(props: AvatarWithStatusProps) {
    const { online = false, ...other } = props;

    return (
        <div>
            {online ? (
                <Badge
                    color="success"
                    variant="solid"
                    size="sm"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeInset="4px 4px"
                >
                    <Avatar size="sm" {...other} />
                </Badge>
            ) : (
                <Avatar size="sm" {...other} />
            )}
        </div>
    );
}
