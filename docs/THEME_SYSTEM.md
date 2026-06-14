# VIYEKO Theme System

The VIYEKO platform uses a **Semantic Variable Architecture** to handle Light and Dark modes. This ensures accessibility and prevents "theme flash" on load.

## 1. Design Tokens (`src/index.css`)

We avoid hardcoded colors. Components must use the following variables:

- `--charcoal`: Main background (Light: White | Dark: Navy-Black)
- `--slate-50` to `--slate-900`: Text and UI accents (Automatically inverts contrast)
- `--glass-bg`: Translucent card background
- `--edge-shadow`: Depth effect tailored for the current background brightness

## 2. Semantic Utilities

- `.bg-subtle`: Use for input fields and minor containers.
- `.border-subtle`: Use for dividers and card borders.

## 3. Implementation Details

- **Initial Resolution:** A blocking `<script>` in `index.html` checks `localStorage` and `prefers-color-scheme` before the React app even starts. This eliminates the "white flash" issue.
- **Dynamic Toggle:** The `ThemeContext` provides a `toggleTheme` function that updates the `<html>` class and persists the user preference.
