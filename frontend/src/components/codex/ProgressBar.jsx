function ProgressBar({ percent }) {
  return (
    <div className="codex-progress-bar" aria-label={`${percent}% descubierto`}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}

export default ProgressBar;
