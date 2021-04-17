import {
  ChangeEvent,
  ChangeEventHandler,
  KeyboardEventHandler,
  useRef,
  useState,
} from 'react';
import { format } from 'date-fns';
import DateFnsUtils from '@date-io/date-fns'; // choose your lib
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import {
  createStyles,
  Divider,
  IconButton,
  InputBase,
  makeStyles,
  MenuItem,
  Paper,
  Select,
} from '@material-ui/core';
import ClearIcon from '@material-ui/icons/Clear';
import AddIcon from '@material-ui/icons/Add';
import EventAvailableIcon from '@material-ui/icons/EventAvailable';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { useAppDispatch, useAppSelector } from '../../../redux/hooks';

import { addTodo } from '../../../redux/todoSlice';
import { selectTags } from '../../../redux/tagSlice';
import TagChip from '../../TagChip';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.default,
      alignItems: 'center',
      margin: theme.spacing(2),
      overflow: 'hidden',
    },
    optionContainer: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      backgroundColor: theme.palette.background.default,
    },
    optionIcon: {
      color: theme.palette.text.secondary,
      marginRight: theme.spacing(2),
    },
    option: {
      display: 'flex',
      width: '100%',
      boxSizing: 'border-box',
      alignItems: 'center',
      padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
      '&:last-child': {
        paddingTop: 0,
      },
    },
    dateSelect: {
      minHeight: theme.spacing(3),
      padding: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      background: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[2],
      cursor: 'pointer',
      '&:focus': {
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.grey[200],
      },
      '& .MuiInputBase-input': {
        minHeight: theme.spacing(3),
        padding: 0,
        fontSize: theme.typography.subtitle2.fontSize,
        fontWeight: theme.typography.subtitle2.fontWeight,
        cursor: 'pointer',
      },
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    tagSelect: {
      flexGrow: 1,
      minHeight: theme.spacing(3),
      padding: theme.spacing(1),
      paddingRight: `${theme.spacing(5)}px !important`,
      background: theme.palette.background.paper,
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[2],
      '&:focus': {
        borderRadius: theme.shape.borderRadius,
        background: theme.palette.grey[200],
      },
    },
    tagSelectIcon: {
      marginRight: theme.spacing(1),
    },
    titleInputContainer: {
      display: 'flex',
      // flexDirection: 'column',
      backgroundColor: theme.palette.background.paper,
      alignItems: 'center',
      width: '100%',
      zIndex: 100,
    },
    titleInput: {
      width: '100%',
      padding: theme.spacing(1),
    },
  }),
);

export default function TodoInput() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const tags = useAppSelector(selectTags);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [, setTitleFocus] = useState(false);
  const [titleState, setTitleState] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tagState, setTagState] = useState<string[]>([]);
  const [tagOpen, setTagOpen] = useState(false);

  const handleSend = () => {
    // inputRef.current?.focus();
    if (titleState.length === 0) return;

    const dueDate = selectedDate ? format(selectedDate, 'T') : undefined;
    const tagName = tagState.length > 0 ? tagState[0] : undefined;
    dispatch(addTodo({ title: titleState, dueDate, tagName }));

    setSelectedDate(null);
    setTagState([]);
    setTitleState('');
  };

  const handleTitleChange: ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (event) => {
    setTitleState(event.target.value);
  };

  const handleKeyDown: KeyboardEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleTagChange = (event: ChangeEvent<{ value: unknown }>) => {
    setTagState(event.target.value as string[]);
    setTagOpen(false);
  };

  return (
    <div>
      <Paper className={classes.container} elevation={2}>
        {/* <Collapse in={optionsOpen}
      // timeout={2000}
      > */}
        <div
          className={classes.optionContainer}
          style={{
            transition: 'transform 0.3s',
            overflow: 'hidden',
            height: titleState.length > 0 ? '' : 0,
            transform:
              titleState.length > 0 ? 'translateY(0)' : 'translateY(100%)',
            transformOrigin: 'bottom',
          }}
        >
          <div className={classes.option}>
            <EventAvailableIcon className={classes.optionIcon} />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DateTimePicker
                InputProps={{
                  disableUnderline: true,
                  classes: { root: classes.dateSelect },
                  endAdornment: selectedDate ? (
                    <IconButton
                      style={{ padding: 0 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedDate(null);
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  ) : (
                    ''
                  ),
                }}
                variant="inline"
                fullWidth
                value={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                }}
                autoOk
                disablePast
                minutesStep={5}
                initialFocusedDate={new Date().setHours(23, 59)}
              />
            </MuiPickersUtilsProvider>
          </div>
          <div className={classes.option}>
            <LocalOfferIcon className={classes.optionIcon} />
            <Select
              multiple
              id="todo-input-tag-select"
              value={tagState}
              onChange={handleTagChange}
              open={tagOpen}
              onOpen={() => {
                setTagOpen(true);
              }}
              onClose={() => {
                setTagOpen(false);
              }}
              renderValue={(selected) => (
                <div className={classes.chips}>
                  {(selected as string[]).map((tagName) => (
                    <TagChip
                      key={`todo-input-tag-selected-${tagName}`}
                      tagName={tagName}
                    />
                  ))}
                </div>
              )}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                getContentAnchorEl: null,
              }}
              IconComponent={(props: { className: string }) => (
                <ExpandMoreIcon
                  className={`${props.className} ${classes.tagSelectIcon}`}
                />
              )}
              disableUnderline
              style={{ flexGrow: 1 }}
              classes={{ root: classes.tagSelect }}
              // variant="outlined"
            >
              {tags.map((tag) => (
                <MenuItem key={`todo-input-tag-${tag.name}`} value={tag.name}>
                  <TagChip tagName={tag.name} />
                </MenuItem>
              ))}
            </Select>
          </div>
          <Divider style={{ width: '100%' }} />
        </div>
        {/* </Collapse> */}
        <div className={classes.titleInputContainer}>
          <InputBase
            className={classes.titleInput}
            placeholder="Add a todo"
            value={titleState}
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            inputRef={inputRef}
            onFocus={() => {
              setTitleFocus(true);
            }}
            onBlur={() => {
              setTitleFocus(false);
            }}
          />
          <Divider style={{ height: '75%' }} orientation="vertical" />
          <IconButton onClick={handleSend}>
            <AddIcon />
          </IconButton>
        </div>
      </Paper>
    </div>
  );
}
