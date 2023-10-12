import { Box, Button, Grid, Popover, Typography } from '@mui/material';
import UsbIcon from '@mui/icons-material/Usb';
import React from 'react';
import { Connection } from '../../Types/Types';

export type Props = {
  disabledConnection: boolean;
  getPorts: () => void;
  connected: Connection;
  disconnect: () => void;
};

export const ConnectionButton: React.FC<Props> = ({
  disabledConnection,
  getPorts,
  connected,
  disconnect,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  let content = null;

  if (connected === 'initial') {
    content = (
      <Typography component="span">
        Необходимо подключиться к устройствам
      </Typography>
    );
  } else if (connected === 'connecting') {
    content = <Typography component="span">Ищем устройства</Typography>;
  } else if (connected === 'connected') {
    content = <Typography component="span">Подключено</Typography>;
  } else if (connected === 'not-found') {
    content = (
      <Typography component="span">
        Повторите попытку. Возможно устройства не подключены - проверьте
        подключение
      </Typography>
    );
  }

  return (
    <Box component="div">
      <Button
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        startIcon={<UsbIcon />}
        disabled={disabledConnection}
        onClick={() => {
          getPorts();
          handlePopoverClose();
        }}
        variant="contained"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        Найти устройства
      </Button>

      {/*<Button*/}
      {/*  onClick={() => {*/}
      {/*    disconnect();*/}
      {/*  }}*/}
      {/*  variant="contained"*/}
      {/*>*/}
      {/*  Отключиться от устройств*/}
      {/*</Button>*/}
      <Box component="div">{content}</Box>
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: 'none',
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography sx={{ p: 1 }}>
          Сначало надо подключиться к устройством (контроллеру для работы с
          клапанами и датчику Co2)
        </Typography>
      </Popover>
    </Box>
  );
};
