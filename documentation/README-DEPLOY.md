# StreamVault Frontend - Deployment

Este documento explica cómo desplegar el frontend de StreamVault en cualquier VM sin configuración previa de Docker.

---

## Requisitos

- Una VM con **Ubuntu 22.04+** (o cualquier distribución Linux)
- Acceso a **internet** para descargar Docker y la imagen
- Acceso al **backend API** de StreamVault

---

## Quick Start

### Opción 1: Script automatizado (recomendado)

```bash
# 1. Descargar el script
curl -O https://raw.githubusercontent.com/ManuelBth/streamvault-frontend/main/documentation/deploy.sh

# 2. Ejecutar con permisos
chmod +x deploy.sh

# 3. Desplegar (reemplaza con tu URL del backend)
sudo ./deploy.sh --api-url http://TU_BACKEND:8080/api/v1
```

### Opción 2: Docker directo

```bash
# 1. Instalar Docker (si no está)
curl -fsSL https://get.docker.com | sh

# 2. Arrancar el contenedor
docker run -d \
  --name streamvault-frontend \
  -p 80:80 \
  -e API_URL=http://TU_BACKEND:8080/api/v1 \
  ghcr.io/manuelbth/streamvault-frontend:latest
```

---

## Configuración

### Variables de entorno obligatorias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `API_URL` | URL del backend API | `http://backend:8080/api/v1` |
| `WS_URL` | URL del WebSocket | `ws://backend:8080/ws` |
| `MINIO_URL` | URL de MinIO | `http://minio:9000` |

### Usar con docker-compose

```yaml
# docker-compose.yml
services:
  frontend:
    image: ghcr.io/manuelbth/streamvault-frontend:latest
    ports:
      - "80:80"
    environment:
      - API_URL=http://backend:8080/api/v1
      - WS_URL=ws://backend:8080/ws
      - MINIO_URL=http://minio:9000
    restart: unless-stopped
```

```bash
docker-compose up -d
```

---

## Puertos

| Puerto | Servicio |
|--------|----------|
| 80 | HTTP (Frontend) |

---

## Comandos útiles

```bash
# Ver logs en tiempo real
docker logs -f streamvault-frontend

# Reiniciar el contenedor
docker restart streamvault-frontend

# Detener el contenedor
docker stop streamvault-frontend

# Ver estado
docker ps

# Actualizar imagen
docker pull ghcr.io/manuelbth/streamvault-frontend:latest
docker restart streamvault-frontend
```

---

## Solución de problemas

### El contenedor no inicia

```bash
# Ver logs
docker logs streamvault-frontend

# Verificar variables de entorno
docker exec streamvault-frontend env
```

### No conecta al backend

1. Verificar que la URL del backend sea correcta
2. Verificar conectividad desde el contenedor:
   ```bash
   docker exec streamvault-frontend curl http://TU_BACKEND:8080/api/v1
   ```
3. Si están en diferentes redes Docker, crear una red compartida:
   ```bash
   docker network create streamvault-network
   docker network connect streamvault-network streamvault-frontend
   docker network connect streamvault-network TU_BACKEND_CONTAINER
   ```

### Cambiar configuración

```bash
# Detener
docker stop streamvault-frontend
docker rm streamvault-frontend

# Arrancar con nueva configuración
docker run -d \
  --name streamvault-frontend \
  -p 80:80 \
  -e API_URL=http://NUEVO_BACKEND:8080/api/v1 \
  ghcr.io/manuelbth/streamvault-frontend:latest
```

---

## Arquitectura

```
┌─────────────────────┐
│   VM Production     │
│                     │
│  ┌───────────────┐  │
│  │ Docker        │  │
│  │               │  │
│  │ ┌───────────┐ │  │
│  │ │Frontend   │ │  │
│  │ │:80        │ │  │
│  │ └───────────┘ │  │
│  └───────────────┘  │
│         ▲           │
│         │           │
│    ┌────┴────┐      │
│    │ Network │      │
│    └────┬────┘      │
└─────────┼───────────┘
          │
          ▼
┌─────────────────────┐
│  Backend API        │
│  (otra VM o same)   │
│  :8080              │
└─────────────────────┘
```

---

## Actualización

Para actualizar a la última versión:

```bash
# Descargar nueva imagen
docker pull ghcr.io/manuelbth/streamvault-frontend:latest

# Reiniciar contenedor
docker restart streamvault-frontend
```

---

## Links

- **Imagen Docker**: `ghcr.io/manuelbth/streamvault-frontend`
- **Repositorio**: https://github.com/ManuelBth/streamvault-frontend
- **Actions**: https://github.com/ManuelBth/streamvault-frontend/actions
