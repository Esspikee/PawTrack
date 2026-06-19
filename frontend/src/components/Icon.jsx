const icons = {
  arrowLeft: "M19 12H5m7-7-7 7 7 7",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h4",
  calendar: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
  chevronRight: "m9 18 6-6-6-6",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  home: "m3 11 9-8 9 8v9H5v-9",
  lock: "M7 11V7a5 5 0 0 1 10 0v4M6 11h12v10H6V11Z",
  mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
  map: "M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6",
  mapPin: "M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  menu: "M4 6h16M4 12h16M4 18h16",
  paw: "M8.5 10.5c1.2 0 2.1 1 2.1 2.2 0 1.5-1 2.8-2.1 2.8s-2.1-1.3-2.1-2.8c0-1.2.9-2.2 2.1-2.2Zm7 0c1.2 0 2.1 1 2.1 2.2 0 1.5-1 2.8-2.1 2.8s-2.1-1.3-2.1-2.8c0-1.2.9-2.2 2.1-2.2ZM6.3 5.2c1 0 1.8.9 1.8 2s-.8 2-1.8 2-1.8-.9-1.8-2 .8-2 1.8-2Zm5.7-1.7c1 0 1.8 1 1.8 2.2S13 8 12 8s-1.8-1-1.8-2.3S11 3.5 12 3.5Zm5.7 1.7c1 0 1.8.9 1.8 2s-.8 2-1.8 2-1.8-.9-1.8-2 .8-2 1.8-2ZM12 13c2.2 0 4.2 1.9 4.2 4 0 1.8-1.4 3-4.2 3s-4.2-1.2-4.2-3c0-2.1 2-4 4.2-4Z",
  plus: "M12 5v14M5 12h14",
  search: "M11 19a8 8 0 1 1 5.7-2.3L21 21",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v3m0 14v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M2 12h3m14 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.1-5.6-2.9-5.6 2.9 1.1-6.1L3 9.6l6.2-.9L12 3Z",
  trophy: "M8 4h8v4a4 4 0 0 1-8 0V4Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 0v5m-4 3h8",
  user: "M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm8 10a8 8 0 0 0-16 0",
};

function Icon({ name, size = 22, strokeWidth = 2, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={`icon ${className}`}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d={icons[name]}
        stroke="currentColor"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeWidth={strokeWidth + 0.35}
      />
    </svg>
  );
}

export default Icon;
