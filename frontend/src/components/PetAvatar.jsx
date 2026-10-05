const palettes = {
  cat: {
    dark: "#09090f",
    mid: "#14172a",
    light: "#fff7e7",
    accent: "#9cff57",
    blush: "#ff9f80",
  },
  golden: {
    dark: "#422414",
    mid: "#b96e2a",
    light: "#f0c88f",
    accent: "#08060d",
    blush: "#ff9f80",
  },
  husky: {
    dark: "#171a2e",
    mid: "#9ea2a7",
    light: "#fff7e7",
    accent: "#78a83b",
    blush: "#ff9f80",
  },
  tabby: {
    dark: "#2a1a13",
    mid: "#5a3f28",
    light: "#d4a767",
    accent: "#9cff57",
    blush: "#ff9f80",
  },
};

function Rect({ fill, h = 1, w = 1, x, y }) {
  return <rect fill={fill} height={h} width={w} x={x} y={y} />;
}

function PuppySprite() {
  return (
    <>
      {/* Stepped outline, floppy ears, cream muzzle and a little pink tongue. */}
      <path fill="#422414" d="M10 4h12v2h4v2h3v3h2v11h-2v3h-4v3h-4v2H11v-2H7v-3H3v-3H1V11h2V8h3V6h4z" />
      <path fill="#e7aa58" d="M10 6h12v2h3v14h-2v3h-3v2h-8v-2H9v-3H7V8h3z" />
      <path fill="#b96e2a" d="M5 9h3v11H6v3H3V12h2zM24 9h3v3h2v11h-3v-3h-2z" />
      <path fill="#ffd18a" d="M11 7h10v2H11zM9 9h3v4H9z" />
      <Rect fill="#241b1b" h={3} w={3} x={9} y={14} />
      <Rect fill="#241b1b" h={3} w={3} x={20} y={14} />
      <Rect fill="#fff7e7" x={9} y={14} />
      <Rect fill="#fff7e7" x={20} y={14} />
      <path fill="#fff0cf" d="M12 18h8v1h3v5h-3v2h-8v-2H9v-5h3z" />
      <path fill="#241b1b" d="M13 18h6v2h-2v3h3v1h-3v1h-2v-1h-3v-1h3v-3h-2z" />
      <Rect fill="#ed8292" h={3} w={2} x={15} y={24} />
      <path fill="#37cad4" d="M10 28h12v2H10z" />
      <Rect fill="#ffe08a" h={2} w={2} x={15} y={29} />
    </>
  );
}

function DogSprite({ colors }) {
  return (
    <>
      <Rect fill={colors.dark} h={5} w={5} x={7} y={2} />
      <Rect fill={colors.dark} h={5} w={5} x={20} y={2} />
      <Rect fill={colors.dark} h={3} w={7} x={6} y={6} />
      <Rect fill={colors.dark} h={3} w={7} x={19} y={6} />
      <Rect fill={colors.dark} h={20} w={22} x={5} y={7} />
      <Rect fill={colors.light} h={18} w={14} x={9} y={8} />
      <Rect fill={colors.mid} h={5} w={6} x={5} y={11} />
      <Rect fill={colors.mid} h={5} w={6} x={21} y={11} />
      <Rect fill="#08060d" h={2} w={2} x={11} y={17} />
      <Rect fill="#08060d" h={2} w={2} x={19} y={17} />
      <Rect fill="#08060d" h={2} w={4} x={14} y={21} />
      <Rect fill={colors.blush} h={1} w={2} x={10} y={22} />
      <Rect fill={colors.blush} h={1} w={2} x={20} y={22} />
      <Rect fill={colors.accent} h={4} w={4} x={14} y={27} />
      <Rect fill="#e8d7c3" h={1} w={2} x={15} y={28} />
    </>
  );
}

function CatSprite({ colors }) {
  return (
    <>
      <Rect fill={colors.dark} h={7} w={6} x={5} y={2} />
      <Rect fill={colors.dark} h={7} w={6} x={21} y={2} />
      <Rect fill={colors.blush} h={2} w={2} x={7} y={5} />
      <Rect fill={colors.blush} h={2} w={2} x={23} y={5} />
      <Rect fill={colors.dark} h={20} w={24} x={4} y={8} />
      <Rect fill={colors.light} h={17} w={10} x={6} y={10} />
      <Rect fill={colors.mid} h={4} w={6} x={18} y={10} />
      <Rect fill={colors.accent} h={2} w={2} x={10} y={17} />
      <Rect fill={colors.accent} h={2} w={2} x={20} y={17} />
      <Rect fill="#08060d" h={2} w={3} x={15} y={21} />
      <Rect fill={colors.light} h={3} w={8} x={12} y={23} />
      <Rect fill={colors.dark} h={10} w={3} x={28} y={12} />
      <Rect fill={colors.dark} h={3} w={5} x={25} y={10} />
    </>
  );
}

function PetAvatar({ type = "husky", size = "md" }) {
  const colors = palettes[type] ?? palettes.husky;
  const isCat = type === "cat" || type === "tabby";

  return (
    <svg
      aria-hidden="true"
      className={`pet-avatar ${type} ${size}`}
      role="img"
      shapeRendering="crispEdges"
      viewBox="0 0 32 32"
    >
      <Rect fill="rgba(46, 247, 255, 0.25)" h={2} w={20} x={6} y={30} />
      {type === "puppy" ? <PuppySprite /> : isCat ? <CatSprite colors={colors} /> : <DogSprite colors={colors} />}
    </svg>
  );
}

export default PetAvatar;
