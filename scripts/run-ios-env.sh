#!/bin/sh

set -eu

ENV_FILE="${1:-.env}"
shift || true

SIMULATOR_NAME="${IOS_SIMULATOR:-iPhone 16}"

printf '%s' "$ENV_FILE" > /tmp/envfile

cleanup() {
  rm -f /tmp/envfile
}

trap cleanup EXIT INT TERM

export ENVFILE="$ENV_FILE"

exec npx react-native run-ios --simulator="$SIMULATOR_NAME" "$@"
