import PetAvatar from "./PetAvatar";

function NightScene({ compact = false }) {
  return (
    <section className={`night-scene ${compact ? "compact" : ""}`}>
      <div className="moon" />
      <div className="stars" />
      <div className="skyline">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="grass" />
      <div className="pet-pair">
        <PetAvatar size={compact ? "sm" : "lg"} type="husky" />
        <PetAvatar size={compact ? "sm" : "lg"} type="cat" />
      </div>
    </section>
  );
}

export default NightScene;
