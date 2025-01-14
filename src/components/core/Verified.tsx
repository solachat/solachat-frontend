import * as React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/joy/SvgIcon'; // Исправлено на использование правильных типов из @mui/joy

interface VerifiedProps extends SvgIconProps {}

export default function Verified(props: VerifiedProps) {
    return (
        <SvgIcon fontSize="xl" viewBox="0 0 48 48" {...props}> {/* Передаем пропсы для стилей */}
            <circle cx="24" cy="24" r="20" fill="#4dd0e1" />
            <path
                fill="#fff"
                d="M22.491,30.69c-0.576,0-1.152-0.22-1.591-0.659l-6.083-6.084c-0.879-0.878-0.879-2.303,0-3.182
                c0.878-0.879,2.304-0.879,3.182,0l6.083,6.084c0.879,0.878,0.879,2.303,0,3.182C23.643,30.47,23.067,30.69,22.491,30.69z"
            />
            <path
                fill="#fff"
                d="M22.491,30.69c-0.576,0-1.152-0.22-1.591-0.659c-0.879-0.878-0.879-2.303,0-3.182l9.539-9.539
                c0.878-0.879,2.304-0.879,3.182,0c0.879,0.878,0.879,2.303,0,3.182l-9.539,9.539C23.643,30.47,23.067,30.69,22.491,30.69z"
            />
        </SvgIcon>
    );
}
