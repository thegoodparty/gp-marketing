#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
hooks_dir="${repo_root}/.git/hooks"
source_hook="${repo_root}/scripts/git-hooks/pre-push"
target_hook="${hooks_dir}/pre-push"

mkdir -p "${hooks_dir}"
cp "${source_hook}" "${target_hook}"
chmod +x "${target_hook}"

echo "Installed ${target_hook}"
