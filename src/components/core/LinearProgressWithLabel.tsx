import * as React from 'react';
import { Box, Typography, LinearProgress, LinearProgressProps } from '@mui/material';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}

export default LinearProgressWithLabel;
