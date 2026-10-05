import { useState } from "react";
import { getAchievementArt } from "../../data/achievementArt";
import Icon from "../Icon";

export default function AchievementBadge({ achievement }) {
  const art = getAchievementArt(achievement);
  const [failedSource, setFailedSource] = useState("");
  const src = art.asset ? `/images/achievements/${art.asset}.webp` : "";
  return <div className={`achievement-badge badge-${art.rarity} badge-${art.state} badge-tier-${art.tier}`} role="img" aria-label={art.label}>
    <svg className="badge-frame" viewBox="0 0 64 72" aria-hidden="true" shapeRendering="crispEdges">
      <path className="badge-shield" d="M8 4h48v4h4v44h-4v4h-8v4h-8v4H24v-4h-8v-4H8v-4H4V8h4Z" />
      <path className="badge-inset" d="M12 9h40v4h3v35h-4v5h-9v5H22v-5h-9v-5H9V13h3Z" />
      {art.tier >= 2 && <path className="badge-trim" d="M1 20h4v16H1Zm58 0h4v16h-4Z" />}
      {art.tier >= 3 && <path className="badge-trim" d="M0 40h4v4h4v4h4v4H6v-4H2v-4H0Zm64 0h-4v4h-4v4h-4v4h6v-4h4v-4h2Z" />}
      {art.tier >= 4 && <path className="badge-trim" d="M17 2h4v4h-4Zm26 0h4v4h-4Z" />}
      {(art.tier === 5 || art.ornament === "crown") && <path className="badge-trim" d="M24 0h4v4h8V0h4v8H24Z" />}
    </svg>
    {src && failedSource !== src ? <img className="badge-art" src={src} alt="" width={128} height={128} loading="lazy" decoding="async" onError={() => setFailedSource(src)} /> : <div className="badge-fallback"><Icon name={art.state === "hidden" ? "lock" : "trophy"} size={28} /></div>}
    {art.numeral && <b className="badge-numeral" aria-hidden="true">{art.numeral}</b>}
    {art.ornament === "heart" && <i className="badge-heart" aria-hidden="true"><Icon name="heart" size={13} /></i>}
  </div>;
}
