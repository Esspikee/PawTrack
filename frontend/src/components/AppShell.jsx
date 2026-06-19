import BottomNav from "./BottomNav";

function AppShell({ children, withNav = true }) {
  return (
    <main className={`app-shell ${withNav ? "with-nav" : ""}`}>
      {children}
      {withNav && <BottomNav />}
    </main>
  );
}

export default AppShell;
