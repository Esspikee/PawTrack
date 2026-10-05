const coats = {
  "level-tabby": { outline: "#663c25", fur: "#e7aa58", light: "#ffd18a", muzzle: "#fff0cf", patch: "#b96e2a", collar: "#78a83b" },
  "level-husky": { outline: "#343650", fur: "#8995b3", light: "#bdc9dd", muzzle: "#fff7e7", patch: "#525d7c", collar: "#315ed0" },
  "level-tuxedo": { outline: "#343650", fur: "#4b4b6d", light: "#72738e", muzzle: "#fff7e7", patch: "#292a45", collar: "#8d79dd" },
  "level-siamese": { outline: "#594337", fur: "#edcf9b", light: "#fff0cf", muzzle: "#d1a578", patch: "#805d49", collar: "#8d79dd" },
};

export default function LevelSprite({ type }) {
  const c = coats[type];
  const dog = type === "level-husky";
  return <>
    {/* Integer coordinates keep every edge aligned to the same 32px grid as the puppy. */}
    <path fill={c.outline} d="M4 3h3v2h3v2h12V5h3V3h3v17h2v4h-3v3h-5v3H10v-3H5v-3H2v-4h2z" />
    <path fill={c.fur} d="M6 6h2v3h4V9h8v1h4V8h2v13h2v2h-3v3h-5v2h-8v-2H7v-3H4v-2h2z" />
    <path fill={c.patch} d="M6 7h2v3h2v2H6zM26 7h-2v3h-2v2h4z" />
    <path fill="#ed8292" d="M7 9h1v2H7zM24 9h1v2h-1z" />
    <path fill={c.light} d="M11 10h10v2H11zM8 12h3v2H8z" />
    {type === "level-tabby" && <path fill={c.patch} d="M14 9h4v5h-4zM6 18h4v2H6zM22 18h4v2h-4z" />}
    {dog && <path fill={c.muzzle} d="M8 14h5v3h6v-3h5v8h-3v4H11v-4H8zM14 11h4v8h-4z" />}
    {type === "level-tuxedo" && <path fill={c.muzzle} d="M15 13h2v6h3v6h-8v-6h3z" />}
    {type === "level-siamese" && <path fill={c.patch} d="M8 14h16v8h-3v3H11v-3H8z" />}
    <path fill={c.muzzle} d="M11 20h10v2h2v2h-3v2h-8v-2H9v-2h2z" />
    <path fill={dog ? "#315ed0" : type === "level-siamese" ? "#37cad4" : "#241b1b"} d="M9 15h3v3H9zM20 15h3v3h-3z" />
    <path fill="#fff7e7" d="M9 15h1v1H9zM20 15h1v1h-1z" />
    <path fill={dog ? "#241b1b" : "#bd687c"} d="M14 20h4v2h-1v1h-2v-1h-1z" />
    <path fill="#422414" d="M15 23h2v1h2v1h-2v-1h-2v1h-2v-1h2z" />
    {!dog && <path fill={c.outline} d="M3 20h4v1H3zM2 23h5v1H2zM25 20h4v1h-4zM25 23h5v1h-5z" />}
    <path fill={c.collar} d="M10 28h12v2H10z" />
    <path fill="#ffe08a" d="M15 29h2v2h-2z" />
  </>;
}
