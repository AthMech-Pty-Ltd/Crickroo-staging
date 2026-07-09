import { DimensionValue } from 'react-native';

export interface Position {
  top: DimensionValue;
  left: DimensionValue;
}

export const BALL_POSITIONS: Position[] = [
  { top: '30%', left: '48%' },
  { top: '35%', left: '45%' },
  { top: '40%', left: '52%' },
  { top: '45%', left: '49%' },
  { top: '50%', left: '55%' },
  { top: '55%', left: '47%' },
  { top: '60%', left: '50%' },
  { top: '65%', left: '53%' },
  { top: '70%', left: '48%' },
  { top: '25%', left: '51%' },
];

export interface DeliveryLabel {
  value: string;
  title: string;
  style: 'yorker' | 'full' | 'good' | 'short';
}

export const DELIVERY_LABELS: DeliveryLabel[] = [
  { value: '15%', title: 'YORKER', style: 'yorker' },
  { value: '30%', title: 'FULL', style: 'full' },
  { value: '45%', title: 'GOOD', style: 'good' },
  { value: '10%', title: 'SHORT', style: 'short' },
];
