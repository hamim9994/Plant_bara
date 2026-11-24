import { GhostButton } from "../components/ui/GhostButton";

export function NotFoundPage() {
  return (
    <section className="not-found">
      <h1 className="not-found__title">404 / PAGE NOT FOUND</h1>
      <p className="not-found__note">This page is not in the field guide.</p>
      <GhostButton to="/">RETURN HOME</GhostButton>
    </section>
  );
}
