/**
 * Nothing in the modal slot on a normal page render. Required by Next: without
 * a default the slot has no fallback on a hard navigation and the route 404s.
 */
export default function Default() {
  return null;
}
