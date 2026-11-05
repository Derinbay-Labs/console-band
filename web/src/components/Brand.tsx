import { Logo } from "./icons";

export function Brand() {
  return (
    <a className="brand" href="#main" aria-label="console-band">
      <Logo />
      <span>console-band</span>
    </a>
  );
}
