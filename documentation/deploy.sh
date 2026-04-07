#!/bin/bash
#==============================================================================
# StreamVault Frontend - Deployment Script
#==============================================================================
# Este script configura Docker (si no está instalado) y levanta el frontend de
# StreamVault con la configuración de producción.
#
# Uso:
#   ./deploy.sh                    <- Interactivo
#   ./deploy.sh --api-url URL      <- Con parámetros
#   ./deploy.sh --help             <- Mostrar ayuda
#==============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables por defecto
IMAGE_NAME="ghcr.io/manuelbth/streamvault-frontend:latest"
CONTAINER_NAME="streamvault-frontend"
API_URL=""
WS_URL=""
MINIO_URL=""
PORT=80

#------------------------------------------------------------------------------
# Funciones de utilidad
#------------------------------------------------------------------------------

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_banner() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║          StreamVault Frontend - Deployment Script              ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
}

show_help() {
    print_banner
    echo "Uso: $0 [OPCIONES]"
    echo ""
    echo "Opciones:"
    echo "  --api-url URL      URL del backend API (ej: http://backend:8080/api/v1)"
    echo "  --ws-url URL       URL del WebSocket (ej: ws://backend:8080/ws)"
    echo "  --minio-url URL    URL de MinIO (ej: http://minio:9000)"
    echo "  --port PUERTO      Puerto donde escuchará el contenedor (default: 80)"
    echo "  --image IMAGEN    Nombre de la imagen Docker (default: ghcr.io/manuelbth/streamvault-frontend:latest)"
    echo "  --help            Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 --api-url http://mi-backend:8080/api/v1"
    echo "  $0 --api-url https://api.midominio.com --ws-url wss://api.midominio.com/ws"
    echo ""
}

#------------------------------------------------------------------------------
# Verificar y instalar Docker
#------------------------------------------------------------------------------

install_docker() {
    log_warn "Docker no está instalado. Instalando..."
    
    # Actualizar repositorios
    apt-get update -y
    
    # Instalar dependencias
    apt-get install -y ca-certificates curl gnupg
    
    # Añadir clave GPG de Docker
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    
    # Añadir repositorio Docker
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    log_success "Docker instalado correctamente"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        install_docker
    fi
    
    if ! docker info &> /dev/null; then
        log_warn "Docker daemon no está corriendo. Iniciando..."
        systemctl start docker || dockerd &
        sleep 3
    fi
    
    log_success "Docker disponible"
}

#------------------------------------------------------------------------------
# Configuración de red (opcional)
#------------------------------------------------------------------------------

setup_network() {
    # Crear red de Docker si no existe
    if ! docker network ls | grep -q streamvault-network; then
        log_info "Creando red Docker streamvault-network..."
        docker network create streamvault-network 2>/dev/null || true
        log_success "Red creada"
    fi
}

#------------------------------------------------------------------------------
# Deployment
#------------------------------------------------------------------------------

deploy() {
    print_banner
    
    # Verificar Docker
    check_docker
    
    # Setup red
    setup_network
    
    # Verificar que tenemos la API URL
    if [ -z "$API_URL" ]; then
        log_error "Debes especificar --api-url"
        echo ""
        show_help
        exit 1
    fi
    
    # Valores por defecto para WS y MinIO si no se especifican
    if [ -z "$WS_URL" ]; then
        WS_URL=$(echo "$API_URL" | sed 's|http|ws|g' | sed 's|https|wss|g' | sed 's|/api/v1|/ws|')
        log_info "WS_URL inferido: $WS_URL"
    fi
    
    if [ -z "$MINIO_URL" ]; then
        MINIO_URL="http://localhost:9000"
        log_info "MINIO_URL por defecto: $MINIO_URL"
    fi
    
    # Detener contenedor existente si hay
    if docker ps -a | grep -q $CONTAINER_NAME; then
        log_warn "Contenedor existente encontrado. Deteniendo..."
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
    fi
    
    # Pull de la imagen
    log_info "Descargando imagen: $IMAGE_NAME"
    docker pull $IMAGE_NAME
    log_success "Imagen descargada"
    
    # Arrancar contenedor
    log_info "Iniciando contenedor..."
    docker run -d \
        --name $CONTAINER_NAME \
        --network streamvault-network \
        -p $PORT:80 \
        -e API_URL="$API_URL" \
        -e WS_URL="$WS_URL" \
        -e MINIO_URL="$MINIO_URL" \
        --restart unless-stopped \
        $IMAGE_NAME
    
    log_success "Contenedor iniciado!"
    echo ""
    echo "=============================================="
    echo "  StreamVault Frontend desplegado"
    echo "=============================================="
    echo ""
    echo "📍 URL: http://localhost:$PORT"
    echo "🔗 API: $API_URL"
    echo "🔗 WS:  $WS_URL"
    echo "🪣 MinIO: $MINIO_URL"
    echo ""
    echo "Comandos útiles:"
    echo "  docker logs -f $CONTAINER_NAME   # Ver logs"
    echo "  docker stop $CONTAINER_NAME      # Detener"
    echo "  docker restart $CONTAINER_NAME    # Reiniciar"
    echo ""
}

#------------------------------------------------------------------------------
# Manejo de argumentos
#------------------------------------------------------------------------------

while [[ $# -gt 0 ]]; do
    case $1 in
        --api-url)
            API_URL="$2"
            shift 2
            ;;
        --ws-url)
            WS_URL="$2"
            shift 2
            ;;
        --minio-url)
            MINIO_URL="$2"
            shift 2
            ;;
        --port)
            PORT="$2"
            shift 2
            ;;
        --image)
            IMAGE_NAME="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

deploy
