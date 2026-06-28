import Icon from "./Icon";

function PixelDivider({ compact = false }) {
  return (
    <div aria-hidden="true" className={`pixel-divider ${compact ? "compact" : ""}`}>
      <span className="divider-line left" />
      <i />
      <Icon name="heart" size={compact ? 16 : 19} />
      <i />
      <span className="divider-line right" />
    </div>
  );
}

export default PixelDivider;
