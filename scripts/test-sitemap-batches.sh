#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

TEST_FILE="integration/validate-sitemap-urls.test.ts"
BATCH_SIZE=5
SKIP_MAIN=false

usage() {
	cat <<'EOF'
Usage: test-sitemap-batches.sh [options]

Run sitemap integration tests in sequential state batches.

Options:
  --batch-size N   States per batch (default: 5)
  --skip-main      Skip the main sitemap batch
  -h, --help       Show this help

Environment:
  SITEMAP_BASE_URL     Required. Base URL to validate against.
  SITEMAP_CONCURRENCY  Concurrent requests per sitemap (default: 20)
  SITEMAP_TIMEOUT_MS   Per-request timeout in ms (default: 10000)
EOF
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		--batch-size)
			BATCH_SIZE="${2:?--batch-size requires a number}"
			shift 2
			;;
		--skip-main)
			SKIP_MAIN=true
			shift
			;;
		-h | --help)
			usage
			exit 0
			;;
		*)
			echo "Unknown option: $1" >&2
			usage >&2
			exit 1
			;;
	esac
done

if [[ -z "${SITEMAP_BASE_URL:-}" ]]; then
	echo "SITEMAP_BASE_URL env var is required." >&2
	echo "Example: SITEMAP_BASE_URL=https://goodparty.org $0" >&2
	exit 1
fi

if ! [[ "$BATCH_SIZE" =~ ^[1-9][0-9]*$ ]]; then
	echo "--batch-size must be a positive integer (got: $BATCH_SIZE)" >&2
	exit 1
fi

mapfile -t STATES < <(
	bun -e "import { US_STATE_CODES } from './src/lib/sitemap-entries.ts'; console.log(US_STATE_CODES.join('\n'))"
)

PEOPLE_SHARDS=$(
	bun -e "import { PEOPLE_SITEMAP_SHARD_COUNT } from './src/lib/sitemap-entries.ts'; console.log(PEOPLE_SITEMAP_SHARD_COUNT)"
)

state_batch_count=$(( (${#STATES[@]} + BATCH_SIZE - 1) / BATCH_SIZE ))
people_batch_count=$(( (PEOPLE_SHARDS + BATCH_SIZE - 1) / BATCH_SIZE ))
total_batches=$((state_batch_count + people_batch_count))
if [[ "$SKIP_MAIN" == false ]]; then
	total_batches=$((total_batches + 1))
fi

batch_num=0
passed=0

run_batch() {
	local label="$1"
	local pattern="$2"
	batch_num=$((batch_num + 1))
	echo ""
	echo "Batch ${batch_num}/${total_batches}: ${label}"
	bun test "$TEST_FILE" -t "$pattern"
	passed=$((passed + 1))
}

if [[ "$SKIP_MAIN" == false ]]; then
	run_batch "main sitemap" '\(main\)'
fi

for ((i = 0; i < ${#STATES[@]}; i += BATCH_SIZE)); do
	batch_states=("${STATES[@]:i:BATCH_SIZE}")
	states_label=$(IFS=,; echo "${batch_states[*]}")
	states_pattern=$(IFS='|'; echo "${batch_states[*]}")
	run_batch "states ${states_label}" "elections/(${states_pattern})"
done

# The people band is batched on its own. It used to ride along on the state
# batches via a `candidates/<state>` label, which stopped being what the band
# emits — and a selector that matches nothing still prints "all batches passed",
# so the miss was invisible. `\)` anchors on the label's closing paren, without
# which `shard-1` also selects shards 10-19.
for ((i = 0; i < PEOPLE_SHARDS; i += BATCH_SIZE)); do
	shard_batch=()
	for ((j = i; j < i + BATCH_SIZE && j < PEOPLE_SHARDS; j++)); do
		shard_batch+=("$j")
	done
	shards_label=$(IFS=,; echo "${shard_batch[*]}")
	shards_pattern=$(IFS='|'; echo "${shard_batch[*]}")
	run_batch "people shards ${shards_label}" "people/shard-(${shards_pattern})\\)"
done

echo ""
echo "All ${passed} batches passed."
