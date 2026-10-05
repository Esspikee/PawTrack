import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import AppShell from "../components/AppShell";
import Icon from "../components/Icon";
import PetAvatar from "../components/PetAvatar";
import { getLevelAvatar } from "../data/levelAvatars";
import AchievementBadge from "../components/codex/AchievementBadge";
import StatusPanel from "../components/StatusPanel";
import { usePawTrack } from "../context/usePawTrack";

function Profile() {
  const { t } = useTranslation();
  const { achievements = [], achievementPoints = 0, currentUser, loadAchievements, loadCurrentUser, userError, userLoading } = usePawTrack();
  const [badgeRequest, setBadgeRequest] = useState({ loading: true, error: "" });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => loadAchievements?.())
      .then(() => { if (active) setBadgeRequest({ loading: false, error: "" }); })
      .catch((error) => { if (active) setBadgeRequest({ loading: false, error: error.message }); });
    return () => { active = false; };
  }, [loadAchievements, retry]);

  if (userLoading) return <AppShell><StatusPanel message={t("Cargando perfil...")} /></AppShell>;
  if (!currentUser || userError) {
    return <AppShell><StatusPanel action={() => loadCurrentUser().catch(() => {})} message={userError || t("Perfil no disponible.")} type="error" /></AppShell>;
  }

  const nextLevel = { 1: 10, 2: 50, 3: 150, 4: 500 }[currentUser.level];
  const progress = Math.max(0, Math.min(100, currentUser.xpProgress ?? 0));
  const recentBadges = achievements.filter((item) => item.completed)
    .sort((a, b) => (Date.parse(b.unlockedAt) || 0) - (Date.parse(a.unlockedAt) || 0)).slice(0, 3);
  const stats = [
    ["mapPin", "Avistamientos", currentUser.sightings ?? 0],
    ["paw", "Animales", currentUser.animalsDiscovered ?? 0],
    ["star", "Confirmaciones", currentUser.confirmations ?? 0],
  ];

  return <AppShell>
    <header className="profile-heading">
      <h1>{t("Mi perfil")}</h1>
      <Link className="icon-button" to="/settings" aria-label={t("Configuracion")}><Icon name="settings" size={26} /></Link>
    </header>

    <section className="profile-identity" aria-label={t("Mi perfil")}>
      <div className="profile-player">
        <div className="profile-portrait"><PetAvatar size="md" type={getLevelAvatar(currentUser.level)} /></div>
        <div className="profile-player-copy">
          <strong>{currentUser.username}</strong>
          <span className="profile-level">{t("Nivel")} {currentUser.level} - {t(currentUser.rank)}</span>
        </div>
      </div>
      <div className="profile-xp-copy">
        <strong>{currentUser.points}{nextLevel ? ` / ${nextLevel}` : ""} XP</strong>
        <small>{nextLevel ? t("{0} XP para subir", { 0: Math.max(0, nextLevel - currentUser.points) }) : t("¡Alcanzaste el nivel Leyenda!")}</small>
      </div>
      <div className="progress profile-xp-bar" role="progressbar" aria-label={t("Progreso de nivel")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <span style={{ width: `${progress}%` }} />
      </div>
    </section>

    <section className="profile-activity" aria-labelledby="profile-activity-title">
      <h2 id="profile-activity-title">{t("Tu actividad")}</h2>
      <dl className="profile-counters">
        {stats.map(([icon, label, value]) => <div key={label}>
          <dt><Icon name={icon} size={26} /><span>{t(label)}</span></dt>
          <dd>{value}</dd>
        </div>)}
      </dl>
    </section>

    <Link className="profile-action profile-sightings-action" to="/my-sightings">
      <Icon name="mapPin" size={28} /><span><strong>{t("Mis avistamientos")}</strong><small>{t("Revisa y administra tus registros")}</small></span><Icon name="chevronRight" size={20} />
    </Link>

    <section className="profile-achievements" aria-labelledby="profile-achievements-title">
      <div className="profile-section-heading"><h2 id="profile-achievements-title">{t("Mis logros")}</h2><Link to="/codex/achievements">{t("Ver todos →")}</Link></div>
      <div className="profile-badge-shelf">
        <div className="profile-paw-points"><Icon name="paw" size={23} /><strong>{achievementPoints} {t("Patitas")}</strong></div>
        {badgeRequest.loading && !achievements.length ? <StatusPanel message={t("Cargando logros...")} /> : badgeRequest.error ?
          <StatusPanel type="error" message={badgeRequest.error} action={() => { setBadgeRequest({ loading: true, error: "" }); setRetry((value) => value + 1); }} /> :
          recentBadges.length ? <ul className="profile-badge-list">
            {recentBadges.map((achievement) => <li key={achievement.id}>
              <div aria-hidden="true"><AchievementBadge achievement={achievement} /></div>
              <span>{t(achievement.label)}</span>
            </li>)}
          </ul> : <p className="profile-badges-empty">{t("Tus logros aparecerán aquí cuando los completes.")}</p>}
      </div>
    </section>

    <Link className="profile-action profile-settings-action" to="/settings">
      <Icon name="settings" size={27} /><span><strong>{t("Configuracion")}</strong><small>{t("Idioma y cuenta")}</small></span><Icon name="chevronRight" size={20} />
    </Link>
  </AppShell>;
}

export default Profile;
