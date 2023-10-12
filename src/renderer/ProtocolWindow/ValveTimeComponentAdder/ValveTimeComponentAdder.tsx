import React from 'react';
import styles from './ValveTimeComponentAdder.module.css';
import {
  LineTypeAirLift,
  LineTypeLight,
  LineTypeOptoAccustic,
  LineTypeStepper,
} from '../../../Types/Types';
import { Button, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

export type Props = {
  lines: Array<
    LineTypeLight | LineTypeStepper | LineTypeAirLift | LineTypeOptoAccustic
  >;
  selectNewLightItem: (selectedLine: LineTypeLight) => void;
  selectNewStepperItem: (selectedLine: LineTypeStepper) => void;
  selectNewAirLiftItem: (selectedLine: LineTypeAirLift) => void;
  selectNewOptoAccustic: (selectedLine: LineTypeOptoAccustic) => void;
};

export const ValveTimeComponentAdder: React.FC<Props> = ({
  lines,
  selectNewLightItem,
  selectNewStepperItem,
  selectNewAirLiftItem,
  selectNewOptoAccustic,
}) => (
  <div>
    {lines.map((line) => {
      let sign = 'Добавить инструкции для управления светом';
      switch (line.id) {
        case 'x':
        case 'y':
        case 'z':
        case 'e':
          sign = `Добавить инструкции для клaпана ${line.id}`;
          break;

        case 'a':
          sign = 'Добавить инструкции для управления компрессором';
          break;

        case 'l':
          sign = 'Добавить инструкции для управления светом';
          break;

        case 'o':
          sign = 'Добавить инструкции для управления оптическим измерителем';
          break;
      }

      return (
        <div className={styles.container} key={line.name + line.id}>
          <Tooltip
            title={<span style={{ fontSize: '1rem' }}>{sign}</span>}
            placement="right"
          >
            <Button
              sx={{
                minWidth: 38,
                height: 38,
                padding: 0,
                borderColor: 'primary.main',
                '& .MuiButton-startIcon': { margin: 0 },
              }}
              variant="contained"
              onClick={() => {
                if (
                  line.id === 'x' ||
                  line.id === 'y' ||
                  line.id === 'z' ||
                  line.id === 'e'
                ) {
                  selectNewStepperItem(line);
                }

                if (line.id === 'a') {
                  selectNewAirLiftItem(line);
                }

                if (line.id === 'l') {
                  selectNewLightItem(line);
                }
                if (line.id === 'o') {
                  selectNewOptoAccustic(line);
                }
              }}
            >
              <AddIcon />
            </Button>
          </Tooltip>
        </div>
      );
    })}
  </div>
);
