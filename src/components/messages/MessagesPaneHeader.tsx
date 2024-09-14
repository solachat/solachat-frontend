import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import { UserProps } from '../core/types';
import { toggleMessagesPane } from '../../utils/utils';

type MessagesPaneHeaderProps = {
    sender?: UserProps;
};

export default function MessagesPaneHeader(props: MessagesPaneHeaderProps) {
    const { sender } = props;

    if (!sender) {
        return null;
    }

    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.body',
            }}
            py={{ xs: 2, md: 2 }}
            px={{ xs: 1, md: 2 }}
        >
            <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
                <IconButton
                    variant="plain"
                    color="neutral"
                    size="sm"
                    sx={{
                        display: { xs: 'inline-flex', sm: 'none' },
                    }}
                    onClick={() => toggleMessagesPane()}
                >
                    <ArrowBackIosNewRoundedIcon />
                </IconButton>
                <Avatar size="lg" src={sender.avatar} />
                <div>
                    <Typography
                        fontWeight="lg"
                        fontSize="lg"
                        component="h2"
                        noWrap
                        endDecorator={
                            sender.online ? (
                                <Chip
                                    variant="outlined"
                                    size="sm"
                                    color="neutral"
                                    sx={{
                                        borderRadius: 'sm',
                                    }}
                                    startDecorator={
                                        <CircleIcon sx={{ fontSize: 8 }} color="success" />
                                    }
                                    slotProps={{ root: { component: 'span' } }}
                                >
                                    Online
                                </Chip>
                            ) : undefined
                        }
                    >
                        {sender.realname}
                    </Typography>
                    <Typography level="body-sm">{sender.username}</Typography>
                </div>
            </Stack>
            <Stack spacing={1} direction="row" alignItems="center">
                <Button
                    startDecorator={<PhoneInTalkRoundedIcon />}
                    color="neutral"
                    variant="outlined"
                    size="sm"
                    sx={{
                        display: { xs: 'none', md: 'inline-flex' },
                    }}
                >
                    Call
                </Button>
                <Button
                    color="neutral"
                    variant="outlined"
                    size="sm"
                    sx={{
                        display: { xs: 'none', md: 'inline-flex' },
                    }}
                >
                    View profile
                </Button>
                <IconButton size="sm" variant="plain" color="neutral">
                    <MoreVertRoundedIcon />
                </IconButton>
            </Stack>
        </Stack>
    );
}
