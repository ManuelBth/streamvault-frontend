#!/bin/bash
set -e

echo "=========================================="
echo "  StreamVault - Bootstrap Script"
echo "=========================================="

# Detectar directorio donde está el script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ==========================================
# 1. Verificar e instalar Docker
# ==========================================
echo ""
echo "[1/5] Verificando Docker..."

if command -v docker &> /dev/null; then
    echo "✓ Docker ya está instalado: $(docker --version)"
else
    echo "✗ Docker no encontrado. Instalando..."

    # Detectar OS
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        OS="unknown"
    fi

    case "$OS" in
        ubuntu|debian|linuxmint)
            apt-get update -qq
            apt-get install -y -qq curl ca-certificates
            curl -fsSL https://get.docker.com | sh
            ;;
        centos|rhel|fedora)
            yum install -y curl
            curl -fsSL https://get.docker.com | sh
            ;;
        *)
            echo "Instalando Docker manualmente..."
            # Instalación genérica
            curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
            sh /tmp/get-docker.sh
            ;;
    esac

    # Habilitar y-start Docker
    systemctl enable --now docker 2>/dev/null || true
    echo "✓ Docker instalado correctamente"
fi

# ==========================================
# 2. Verificar Docker Compose
# ==========================================
echo ""
echo "[2/5] Verificando Docker Compose..."

# Ver si docker tiene el plugin compose o docker-compose standalone
if docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
    echo "✓ Docker Compose plugin disponible"
elif command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
    echo "✓ Docker Compose standalone disponible"
else
    echo "✗ Docker Compose no encontrado. Instalando..."
    curl -sSL "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    COMPOSE_CMD="docker-compose"
    echo "✓ Docker Compose instalado"
fi

# ==========================================
# 3. Crear estructura de directorios
# ==========================================
echo ""
echo "[3/5] Preparando directorio de despliegue..."

cd "$SCRIPT_DIR"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Configuración de producción
# EDITAR ESTOS VALORES PARA TU INSTALACIÓN

# API Backend URL
API_URL=http://localhost:8080/api/v1

# WebSocket URL
WS_URL=ws://localhost:8080/ws

# MinIO URL
MINIO_URL=http://localhost:9000

# Repo de imagen (usuario/proyecto)
IMAGE_REPO=manuelbth/streamvault
EOF
    echo "✓ Archivo .env creado (editar para producción)"
else
    echo "✓ Archivo .env ya existe"
fi

# ==========================================
# 4. Pull de imagen y levanta containers
# ==========================================
echo ""
echo "[4/5] Descargando imagen y levantando servicios..."

# Cargar variables del .env
set -a
source .env 2>/dev/null || true
set +a

# Obtener repo de imagen
REPO="${IMAGE_REPO:-manuelbth/streamvault}"
IMAGE="ghcr.io/${REPO}:latest"

echo "    Imagen: $IMAGE"

# Pull de la imagen
docker pull "$IMAGE" || {
    echo "✗ Error al descargar imagen. Asegúrate de que el repositorio exista."
    echo "    Puedes editar IMAGE_REPO en el archivo .env"
    exit 1
}

echo "✓ Imagen descargada"

# Levantar servicios
echo ""
echo "[5/5] Iniciando servicios..."

$COMPOSE_CMD up -d

echo ""
echo "=========================================="
echo "  ¡StreamVault desplegado!"
echo "=========================================="
echo ""
echo "Servicios activos:"
$COMPOSE_CMD ps
echo ""
echo "Endpoints:"
echo "  - Frontend: http://localhost"
echo "  - Health:   http://localhost/health"
echo ""
echo "Watchtower está corriendo y revisará"
echo "automáticamente cada hora si hay nueva imagen."
echo ""
echo "Para ver logs: docker-compose logs -f"
echo "Para reiniciar: docker-compose restart"
echo ""