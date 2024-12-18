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

export const events: CalendarEvent[] = [
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() - 35)),
    end: new Date(new Date().setDate(new Date().getDate() - 35)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() - 34)),
    end: new Date(new Date().setDate(new Date().getDate() - 34)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() - 33)),
    end: new Date(new Date().setDate(new Date().getDate() - 33)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() - 6)),
    end: new Date(new Date().setDate(new Date().getDate() - 6)),
  },
  /*{
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() - 5)),
    end: new Date(new Date().setDate(new Date().getDate() - 5)),
  }, */
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() - 4)),
    end: new Date(new Date().setDate(new Date().getDate() - 4)),
  },
  /*{
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() - 3)),
    end: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
  {
    title: 'An  event',
    color: colors.red,
    start: new Date(new Date().setDate(new Date().getDate() - 3)),
    end: new Date(new Date().setDate(new Date().getDate() - 3)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() - 2)),
    end: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
  {
    title: 'An  event',
    color: colors.red,
    start: new Date(new Date().setDate(new Date().getDate() - 2)),
    end: new Date(new Date().setDate(new Date().getDate() - 2)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() - 2)),
    end: new Date(new Date().setDate(new Date().getDate() - 2)),
  }, */
  {
    title: 'An  event',
    color: colors.blue,
    start: new Date(new Date().setDate(new Date().getDate() - 1)),
    end: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    title: 'An  event',
    color: colors.red,
    start: new Date(new Date().setDate(new Date().getDate() - 1)),
    end: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    title: 'An  event',
    color: colors.blue,
    start: new Date(new Date().setDate(new Date().getDate() - 1)),
    end: new Date(new Date().setDate(new Date().getDate() - 1)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(),
    end: new Date(),
    allDay: true,
  },
  {
    title: 'A non all day event',
    color: colors.blue,
    start: new Date(),
    end: new Date(),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 3)),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 3)),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 3)),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 3)),
    end: new Date(new Date().setDate(new Date().getDate() + 3)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
  },
  {
    title: 'An  event',
    color: colors.yellow,
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
  },
];

export enum WeekStart {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}
