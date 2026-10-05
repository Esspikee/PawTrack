import { useTranslation } from "../../i18n/useTranslation";
function ProgressBar({ percent }) {
  const { t } = useTranslation();
  return (
    <div className="codex-progress-bar" aria-label={t("{0}% descubierto", {0: percent})}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

export default ProgressBar;
