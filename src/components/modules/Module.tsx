import { Card, CardHeader, makeStyles } from '@material-ui/core';
import { createStyles } from '@material-ui/core/styles';

export interface PropTypes {
  title: string;
  children?: any;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      padding: '1rem',
      borderRadius: 0,
    },
    header: {
      zIndex: theme.zIndex.appBar + 10,
      // boxShadow: theme.shadows[1],
    },
    title: {
      fontWeight: 700,
      transition: '0.3s',
      color: theme.palette.text.secondary,
      '&:hover': {
        color: theme.palette.text.primary,
      },
    },
    body: {
      position: 'relative',
      flexGrow: 1,
      // borderTop: `2px solid ${theme.palette.divider}`,
    },
  }),
);

export default function Module({ title, children }: PropTypes) {
  const classes = useStyles();

  return (
    <Card
      className={classes.root}
      elevation={3}
      style={{ padding: 0 }}
      // variant="outlined"
    >
      <CardHeader
        className={classes.header}
        title={title}
        titleTypographyProps={{
          variant: 'h5',
          className: `${classes.title} module-handle grabbable`,
          style: {
            display: 'unset',
          },
        }}
      />
      <div className={classes.body}>{children}</div>
    </Card>
  );
}
