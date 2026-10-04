#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

APP_DIR=/opt/services/apps/manual-do-bixo-ultimate
SERVICE=manual-do-bixo-ultimate
GATEWAY=nginx-gateway
IMAGE=${1:?Informe a imagem por digest}

# Impede receber uma imagem arbitrária fora deste pacote GHCR.
[[ "$IMAGE" =~ ^ghcr\.io/otbox/manual-do-bixo-ultimate@sha256:[a-f0-9]{64}$ ]] || {
  echo 'Referencia de imagem invalida'; exit 1;
}

cd "$APP_DIR"
test -f compose.yaml
sudo -n docker version >/dev/null

# Também protege contra deploy manual simultâneo.
exec 9>.deploy.lock
flock -n 9 || { echo 'Outro deploy esta em andamento'; exit 1; }

if [[ -f .deploy.env ]]; then
  cp .deploy.env .deploy.previous.env
fi
printf 'APP_IMAGE=%s\n' "$IMAGE" > .deploy.env.new
mv .deploy.env.new .deploy.env

compose() {
  sudo -n docker compose --env-file .deploy.env "$@"
}

compose config --quiet
compose pull "$SERVICE"
compose up -d --no-deps "$SERVICE"

# Site estático (nginx): valida HTTP interno na porta 80.
ready=0
for attempt in $(seq 1 30); do
  if compose exec -T "$SERVICE" wget -qO- http://127.0.0.1/ >/dev/null; then
    ready=1
    break
  fi
  sleep 2
done

if [[ "$ready" != 1 ]]; then
  compose logs --tail 100 "$SERVICE"
  echo 'Deploy falhou na validacao; verifique logs e plano de rollback.'
  exit 1
fi

# Atualiza o upstream quando o IP do container muda.
sudo -n docker exec "$GATEWAY" nginx -t
sudo -n docker exec "$GATEWAY" nginx -s reload
compose ps
printf 'Deploy concluido: %s\n' "$IMAGE"
