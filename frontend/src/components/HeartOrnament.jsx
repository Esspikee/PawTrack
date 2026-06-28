import Icon from "./Icon";

function HeartOrnament({ className = "" }) {
  return (
    <span aria-hidden="true" className={`heart-ornament ${className}`}>
      <i />
      <Icon name="heart" size={15} />
      <i />
    </span>
  );
}

export default HeartOrnament;
