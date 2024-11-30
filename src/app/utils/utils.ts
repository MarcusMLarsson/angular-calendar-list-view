export enum ListView {
  Month = 'month',
  Week = 'week',
  Day = 'day',
}

export interface CalendarEvent<MetaType = any> {
  id?: string | number;
  start: Date;
  end?: Date;
  title: string;
  color?: EventColor;
  actions?: EventAction[];
  allDay?: boolean;
  cssClass?: string;
  resizable?: {
    beforeStart?: boolean;
    afterEnd?: boolean;
  };
  draggable?: boolean;
  meta?: MetaType;
}

export interface EventColor {
  primary: string;
  secondary: string;
  secondaryText?: string;
}
export interface EventAction {
  id?: string | number;
  label: string;
  cssClass?: string;
  a11yLabel?: string;
  onClick({
    event,
    sourceEvent,
  }: {
    event: CalendarEvent;
    sourceEvent: MouseEvent | KeyboardEvent;
  }): any;
}

export const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};
