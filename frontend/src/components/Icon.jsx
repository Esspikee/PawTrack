const icons = {
  arrowLeft: "M6 2h3v3h5v6H9v3H6v-3H2V5h4V2Z",
  bell: "M6 1h4v2h2v2h1v5h2v2H1v-2h2V5h1V3h2V1Zm0 12h4v2H6v-2Z",
  calendar: "M3 1h2v2h6V1h2v2h2v12H1V3h2V1Zm0 6v6h10V7H3Zm2 2h2v2H5V9Zm4 0h2v2H9V9Z",
  camera: "M5 2h6l1 2h3v10H1V4h3l1-2Zm3 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z",
  chevronRight: "M5 2h4v2h2v2h2v4h-2v2H9v2H5v-3h2V9h2V7H7V5H5V2Z",
  eye: "M4 3h8v2h2v2h2v2h-2v2h-2v2H4v-2H2V9H0V7h2V5h2V3Zm4 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
  heart: "M2 3h4v2h4V3h4v2h2v5h-2v2h-2v2h-2v2H6v-2H4v-2H2v-2H0V5h2V3Z",
  home: "M7 1h2v2h2v2h2v2h2v8h-5v-4H6v4H1V7h2V5h2V3h2V1Z",
  lock: "M5 1h6v2h2v4h2v8H1V7h2V3h2V1Zm0 6h6V4H5v3Zm2 3v3h2v-3H7Z",
  mail: "M1 3h14v11H1V3Zm2 3v6h10V6l-5 4-5-4Zm1-1 4 3 4-3H4Z",
  map: "M1 2h3l4 2 4-2h3v12h-3l-4-2-4 2H1V2Zm3 2v8l3-2V6L4 4Zm5 2v4l3 2V4L9 6Z",
  mapPin: "M5 1h6v2h2v2h2v5h-2v2h-2v2H9v2H7v-2H5v-2H3v-2H1V5h2V3h2V1Zm3 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
  menu: "M1 2h14v3H1V2Zm0 5h14v3H1V7Zm0 5h14v3H1v-3Z",
  paw: "M2 1h3v4H2V1Zm9 0h3v4h-3V1ZM0 6h4v4H0V6Zm12 0h4v4h-4V6Zm-7 4h2V8h2v2h2v2h2v4H3v-4h2v-2Z",
  plus: "M6 1h4v5h5v4h-5v5H6v-5H1V6h5V1Z",
  search: "M3 1h7v2h2v2h2v5h-2v2h-2v2H3v-2H1V3h2V1Zm1 3v7h6V9h2V5h-2V3H4v1Zm7 8h3v2h2v2h-4v-2h-1v-2Z",
  settings: "M6 0h4v2h3v3h3v6h-3v3h-3v2H6v-2H3v-3H0V5h3V2h3V0Zm2 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
  star: "M6 0h4v4h5v3h-3v3h2v5l-6-3-6 3v-5H0V6h5V4h1V0Z",
  trophy: "M3 1h10v2h3v6h-3v2h-3v2h3v3H3v-3h3v-2H3V9H0V3h3V1Zm2 2v5h2v2h2V8h2V3H5ZM2 5v2h1V5H2Zm11 0v2h1V5h-1Z",
  user: "M5 1h6v2h2v6h-2v2H5V9H3V3h2V1Zm1 3v5h4V4H6Zm-2 8h8v2h2v2H2v-2h2v-2Z",
};

function Icon({ name, size = 22, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={`icon icon-${name} ${className}`}
      fill="currentColor"
      height={size}
      shapeRendering="crispEdges"
      viewBox="0 0 16 16"
      width={size}
    >
      <path d={icons[name]} fillRule="evenodd" />
    </svg>
  );
}

export default Icon;
