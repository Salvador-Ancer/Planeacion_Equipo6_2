#!/bin/bash
# =====================================================================
# deploy_local.sh
# Wrapper para correr deploy.sh manualmente desde Cloud Shell, sin
# depender de state_get (que solo funciona dentro del pipeline de
# OCI DevOps).
#
# NO subir este archivo a git: contiene secretos en texto plano.
# =====================================================================

export DOCKER_REGISTRY="mx-queretaro-1.ocir.io/axe5wdod0see/reacttodo/ukcyd"
export TODO_PDB_NAME="reacttodoukcyd_medium"
export OCI_REGION="mx-queretaro-1"
export UI_USERNAME="admin"
export DB_PASSWORD="gofnov-wuqzi9-zeNqex"
export GROQ_API_KEY="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"
export TELEGRAM_BOT_TOKEN="8208289082:AAEiLfalwSje2PIEgWi7Sgow-wcUg6CDVec"
export DEEPSEEK_API_KEY="sk-test"

. deploy.sh
