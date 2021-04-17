import { Chip, useTheme } from '@material-ui/core';
import { useAppSelector } from '../redux/hooks';
import { selectTagByName } from '../redux/tagSlice';

export default function TagChip({ tagName }: { tagName: string }) {
  const tag = useAppSelector(selectTagByName(tagName));
  const theme = useTheme();

  const c = tag.color;

  return (
    <Chip
      variant="outlined"
      label={tagName}
      size="small"
      style={{
        borderWidth: '3px',
        borderColor: c,
        background: 'white',
        boxSizing: 'border-box',
        color: c,
        fontSize: theme.typography.subtitle2.fontSize,
        fontWeight: theme.typography.subtitle2.fontWeight,
      }}
    />
    // <Chip
    //   // variant="outlined"
    //   label={tagName}
    //   size="small"
    //   style={{
    //     borderWidth: '3px',
    //     background: c,
    //     color: 'white',
    //     fontSize: theme.typography.subtitle2.fontSize,
    //     fontWeight: theme.typography.subtitle2.fontWeight,
    //   }}
    // />
  );
}
