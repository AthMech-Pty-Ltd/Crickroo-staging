#!/bin/sh

set -eu

ENV_FILE="${1:-.env}"
shift || true

DEVICE_NAME="${IOS_DEVICE:-Murali’s iphone}"

printf '%s' "$ENV_FILE" > /tmp/envfile

cleanup() {
  rm -f /tmp/envfile
}

trap cleanup EXIT INT TERM

export ENVFILE="$ENV_FILE"

exec npx react-native run-ios --device "$DEVICE_NAME" "$@"
