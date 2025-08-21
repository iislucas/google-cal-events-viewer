const defaultSize = `1em`;

export const ICONS: {
  [key: string]: {
    viewbox: string;
    fill: string;
    html: string;
    width: string;
    height: string;
  };
} = {
  calendar_today: {
    viewbox: '0 0 24 24',
    fill: '#5f6368',
    html: `<path d="M0 0h24v24H0z" fill="none"/><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>`,
    width: defaultSize,
    height: defaultSize,
  },
  search: {
    viewbox: '0 -960 960 960',
    fill: '#5f6368',
    html: `<path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>`,
    width: defaultSize,
    height: defaultSize,
  },
  event: {
    viewbox: '0 0 24 24',
    fill: '#5f6368',
    html: `<path d="M0 0h24v24H0z" fill="none"/><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>`,
    width: defaultSize,
    height: defaultSize,
  },
  expand_less: {
    viewbox: '0 -960 960 960',
    fill: '#1f1f1f',
    html: `<path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z"/>`,
    width: defaultSize,
    height: defaultSize,
  },
  expand_more: {
    viewbox: '0 -960 960 960',
    fill: '#1f1f1f',
    html: `<path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/>`,
    width: defaultSize,
    height: defaultSize,
  },
  map: {
    viewbox: '0 0 24 24',
    fill: '#5f6368',
    html: `<path d="M0 0h24v24H0z" fill="none"/><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>`,
    width: defaultSize,
    height: defaultSize,
  },
};
