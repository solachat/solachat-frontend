import * as React from 'react';
import Autocomplete from '@mui/joy/Autocomplete';
import AutocompleteOption from '@mui/joy/AutocompleteOption';
import AspectRatio from '@mui/joy/AspectRatio';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Typography from '@mui/joy/Typography';
import { countries, CountryType, CountrySelectorProps } from '../../utils/CountryType';

export default function CountrySelector({ sx, value, onChange, ...other }: CountrySelectorProps) {
    return (
        <FormControl
            {...other}
            sx={[{ display: { sm: 'contents' } }, ...(Array.isArray(sx) ? sx : [sx])]}
        >
            <FormLabel>Country</FormLabel>
            <Autocomplete
                size="sm"
                autoHighlight
                isOptionEqualToValue={(option: CountryType, val: CountryType) => option.code === val.code}
                value={countries.find((c) => c.code === value) || null}
                onChange={(event, newValue) => onChange(newValue ? newValue.code : '')}
                options={countries}
                renderOption={(optionProps, option: CountryType) => (
                    <AutocompleteOption {...optionProps}>
                        <ListItemDecorator>
                            <AspectRatio ratio="1" sx={{ minWidth: 20, borderRadius: '50%' }}>
                                <img
                                    loading="lazy"
                                    width="20"
                                    srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                    src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                    alt=""
                                />
                            </AspectRatio>
                        </ListItemDecorator>
                        {option.label}
                        <Typography component="span" textColor="text.tertiary" ml={0.5}>
                            (+{option.phone})
                        </Typography>
                    </AutocompleteOption>
                )}
                slotProps={{
                    input: {
                        autoComplete: 'new-password',
                    },
                }}
            />
        </FormControl>
    );
}
