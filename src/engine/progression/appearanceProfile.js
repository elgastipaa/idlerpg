const VALID_BANNERS = new Set(["ember", "abyss", "codex"]);
const VALID_PALETTES = new Set(["sanctuary", "forge", "midnight"]);
const VALID_TITLES = new Set(["wayfarer", "echo_bearer", "abyss_watcher"]);

export function createEmptyAppearanceProfile() {
  return {
    version: 1,
    banner: "ember",
    palette: "sanctuary",
    title: "wayfarer",
    badge: null,
  };
}

export function normalizeAppearanceProfile(profile = {}) {
  const base = createEmptyAppearanceProfile();
  const banner = VALID_BANNERS.has(profile?.banner) ? profile.banner : base.banner;
  const palette = VALID_PALETTES.has(profile?.palette) ? profile.palette : base.palette;
  const title = VALID_TITLES.has(profile?.title) ? profile.title : base.title;
  const badge = profile?.badge ? String(profile.badge) : null;
  return {
    ...base,
    ...profile,
    banner,
    palette,
    title,
    badge,
  };
}
