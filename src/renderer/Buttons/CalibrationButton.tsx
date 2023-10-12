import React from 'react';
import { Button, Popover, Typography } from '@mui/material';
import EqualizerIcon from '@mui/icons-material/Equalizer';

export type Props = {
  showCalibration: boolean;
  setShowCalibration: (value: boolean) => void;
};

export const CalibrationButtons: React.FC<Props> = ({
  showCalibration,
  setShowCalibration,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        startIcon={<EqualizerIcon />}
        onClick={() => {
          setShowCalibration(!showCalibration);
          handlePopoverClose();
        }}
        variant="contained"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {!showCalibration ? 'Показать Калибровку' : 'Скрыть калибровку'}
      </Button>
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
          Необходимо задавать калибровку для работы клапанов
        </Typography>
      </Popover>
    </>
  );
};
