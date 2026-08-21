# Tauri Local Runbook

## Current State

Tauri has been scaffolded under `orbitrack-react/src-tauri`. Electron remains in place as rollback.

## Prerequisites

- Node/npm dependencies installed in `orbitrack-react`.
- Rust toolchain installed locally (`rustc` and `cargo` on PATH).
- Windows WebView2 runtime.

Rust, Cargo, rustup, WebView2, and Visual Studio Build Tools/MSVC are now installed and detected by `tauri info`.

## Commands

From `orbitrack-react/`:

- `npm run dev` starts the Vite UI.
- `npm run build` builds the React frontend.
- `npm run test` runs Vitest.
- `npm run verify` runs lint, build, and tests.
- `npm run tauri:dev` starts the Tauri desktop shell.
- `npm run tauri:build` creates the Windows Tauri installer once Rust is installed.
- `deno test --allow-env supabase/functions/tests/` checks Supabase Edge Function helpers.

## Last Local Check

- `npm --prefix orbitrack-react run tauri -- info`: passed environment detection for WebView2, MSVC, rustc, cargo, rustup, and the stable MSVC Rust toolchain.
- `npm --prefix orbitrack-react run tauri:build`: passed.
- Installer output: `orbitrack-react\src-tauri\target\release\bundle\nsis\Orbitrack Executive_3.5.11_x64-setup.exe`.
- Executive login with existing vanilla credentials requires the deployed
  `auth-password-login` Edge Function; the local installer will not fix remote
  login until that function is deployed to the Supabase project used by
  `VITE_SUPABASE_URL`.

## Security Model

The Tauri shell exposes only `core:default` and `opener:default`. Do not add broad filesystem, shell, process, clipboard, or global shortcut permissions without a specific feature design and test coverage.

## Rollback

Keep using the Electron scripts in the root package until Tauri passes build, smoke, signing, update, and security verification.
