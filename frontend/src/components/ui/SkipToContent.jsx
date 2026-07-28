/**
 * HAFROSE — Skip to Main Content Link (Phase 5.7)
 * Allows keyboard and screen reader users to bypass the navigation header.
 */
export default function SkipToContent({ targetId = 'main-content' }) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-to-content sr-only sr-only-focusable"
    >
      Aller au contenu principal
    </a>
  );
}
