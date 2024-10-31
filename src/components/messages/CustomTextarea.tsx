import { styled } from '@mui/system';
import Textarea from '@mui/joy/Textarea';

const CustomTextarea = styled(Textarea)({
    flexGrow: 1,
    minHeight: 'auto',
    padding: '8px',
    resize: 'none',
    backgroundColor: 'var(--joy-palette-background-level1)',
    maxWidth: '100%',
    border: 'none',
    color: 'inherit',
    boxShadow: 'none !important',
    outline: 'none !important',
    '&:focus': {
        outline: 'none !important',
        boxShadow: 'none !important',
        borderColor: 'transparent !important',
    },
    '&:focus-visible': {
        outline: 'none !important',
        boxShadow: 'none !important',
        borderColor: 'transparent !important',
    },
    '&.Mui-focused': {
        outline: 'none !important',
        boxShadow: 'none !important',
        borderColor: 'transparent !important',
    },
    '&.Textarea-focusedHighlight': {
        outline: 'none !important',
        boxShadow: 'none !important',
        borderColor: 'transparent !important',
    },
    '--Textarea-focusedHighlight': 'transparent !important',
});

export default CustomTextarea;
