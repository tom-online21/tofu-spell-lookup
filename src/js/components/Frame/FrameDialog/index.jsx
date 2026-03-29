import React, { useMemo, useState, } from 'react';

// MUI
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// MUI Icons
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';

// MUI Other
import IconButton from '@mui/material/IconButton';

// Other Components
import { DialogCloseButton } from '../../Generic/DialogCloseButton';
import { FrameSection } from './FrameSection';

// Redux
import {
    useSelector,
} from 'react-redux';
import {
    selectAllFrames,
} from '../../../redux/slices/frames'

// Utilities
import {
    FRAME_SOURCE_EMOJIS,
} from '../../../utilities/constants';

const allFrameSources = Object.keys(FRAME_SOURCE_EMOJIS);

export const FrameDialog = ({
    open,
    onClose,
    onSelect,
}) => {
    const frames = useSelector(selectAllFrames);
    const [frameFilters, setFrameFilters] = useState(allFrameSources);
    const [searchQuery, setSearchQuery] = useState('');

    const framesByAlpha = useMemo(() => {
        const includeAllFrames = frameFilters.length === allFrameSources.length;
        const normalizedSearch = searchQuery.trim().toLowerCase();
        const frameMapDividedByAlpha = frames.reduce((acc, curr) => {
            const frameName = curr.name;
            const firstLetter = frameName[0].toUpperCase();

            const matchesSource = includeAllFrames || frameFilters.includes(curr.source);
            const matchesSearch = !normalizedSearch || frameName.toLowerCase().includes(normalizedSearch);

            if (matchesSource && matchesSearch) {
                if (!acc.has(firstLetter)) {
                    acc.set(firstLetter, [curr]);
                }
                else {
                    acc.get(firstLetter).push(curr);
                }
            }

            return acc;
        }, new Map());

        const sortedEntries = [];
        
        frameMapDividedByAlpha.forEach((value, key) => {
            sortedEntries.push([
                key,
                value.sort((a, b) => a.name.localeCompare(b.name)),
            ]);
        })
        const frameMapSortedByAlpha = new Map(sortedEntries.sort(([aKey], [bKey]) => aKey.localeCompare(bKey)));

        return frameMapSortedByAlpha;
    }, [frames, frameFilters, searchQuery]);
    const frameLetters = useMemo(() => Array.from(framesByAlpha.keys()), [framesByAlpha]);

    const allChecked = frameFilters.length === allFrameSources.length;
    const allIndeterminate = !allChecked && frameFilters.length > 0;

    const handleAllChange = (e) => {
        const {
            target: {
                checked,
            }
        } = e;

        if (checked) {
            setFrameFilters(allFrameSources);
        }
        else {
            setFrameFilters([]);
        }
    };

    const handleFilterChange = (e) => {
        const {
            target: {
                checked,
                name,
            }
        } = e;

        if (checked) {
            setFrameFilters(prevFilters => [...prevFilters, name]);
        }
        else {
            setFrameFilters(prevFilters => prevFilters.filter(filter => filter !== name));
        }
    };

    return (
        <Dialog
            fullWidth
            keepMounted
            maxWidth='lg'
            open={open}
            onClose={onClose}
        >
            <DialogTitle
                style={{
                    paddingBottom: '.5rem',
                    paddingTop: '.5rem',
                }}
            >
                Select a Frame
                <DialogCloseButton onClick={onClose} />
            </DialogTitle>
            <DialogContent
                dividers
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '.25rem',
                    overflow: 'visible',
                }}
            >
                <TextField
                    fullWidth
                    placeholder='Search frames by name...'
                    size='small'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position='start'>
                                <SearchRoundedIcon />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                            <InputAdornment position='end'>
                                <IconButton
                                    size='small'
                                    onClick={() => setSearchQuery('')}
                                    edge='end'
                                >
                                    <ClearRoundedIcon fontSize='small' />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        my: 0.5,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                        },
                    }}
                />
                <Accordion
                    className='frame-dialog-section-accordion'
                    disableGutters
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreRoundedIcon />}
                    >
                        <Typography variant='h6'>Filter By Frame Source</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <FormGroup>
                        <FormControlLabel 
                            label="All"
                            control={
                                <Checkbox 
                                    checked={allChecked}
                                    indeterminate={allIndeterminate}
                                    onChange={handleAllChange}
                                />
                            }
                        />
                        <div
                            style={{
                                border: '1px solid rgba(255,255,255,.23)',
                                borderRadius: '4px',
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between',
                                marginLeft: '1em',
                                paddingLeft: '16px',
                            }}
                        >
                            {
                                Object.entries(FRAME_SOURCE_EMOJIS).map(([key, emoji]) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={frameFilters.includes(key)}
                                                name={key}
                                                onChange={handleFilterChange}
                                            />
                                        }
                                        key={key}
                                        label={`${emoji} ${key}`}
                                    />
                                ))
                            }
                        </div>
                    </FormGroup>
                    </AccordionDetails>
                </Accordion>
                {
                    frameLetters.length === 0 && searchQuery.trim() && (
                        <Typography
                            variant='body1'
                            color='text.secondary'
                            textAlign='center'
                            sx={{ py: 4 }}
                        >
                            No frames found matching "{searchQuery.trim()}"
                        </Typography>
                    )
                }
                {
                    frameLetters.map((letter) => (
                        <FrameSection
                            key={letter}
                            letter={letter}
                            frames={framesByAlpha.get(letter)}
                            onFrameClick={onSelect}
                        />
                    ))
                }
            </DialogContent>
        </Dialog>
    )
};
