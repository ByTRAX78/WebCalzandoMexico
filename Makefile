# === Variables (¡Configura esto!) ===
NPM = npm
IMAGE_NAME = mi-app-hackaton
CONTAINER_NAME = mi-app-run
# Descomenta esto si usas un archivo .env
# ENV_FILE = --env-file .env

# === Comandos Principales ===

.PHONY: help
help:
	@echo "=== Comandos del Hackaton ==="
	@echo "make setup       - (Correr 1ra vez) Crea package.json e instala todo"
	@echo "make dev         - (El que más usarás) Inicia en modo desarrollo"
	@echo "make start       - Inicia en modo producción (localmente)"
	@echo "make clean       - Borra node_modules"
	@echo ""
	@echo "=== Comandos de Docker ==="
	@echo "make docker-up   - (Todo en uno) Construye la imagen Y levanta el contenedor"
	@echo "make docker-stop - Detiene y elimina el contenedor"
	@echo "make docker-logs - Muestra los logs del contenedor"

# Setup inicial (solo correr la primera vez)
.PHONY: setup
setup:
	@echo "=== Configurando proyecto por primera vez ==="
	$(NPM) init -y
	@echo "Instalando dependencias..."
	$(NPM) install express dotenv
	$(NPM) install --save-dev nodemon
	@echo "\n=== ¡Setup completado! ==="
	@echo "IMPORTANTE: Agrega los scripts 'start' y 'dev' a tu package.json"
	@echo '"scripts": {'
	@echo '  "start": "node index.js",'
	@echo '  "dev": "nodemon index.js"'
	@echo '}'

# Instalar dependencias (si ya tienes package.json)
.PHONY: install
install:
	@echo "=== Instalando dependencias ==="
	$(NPM) install

# Limpiar el proyecto
.PHONY: clean
clean:
	@echo "=== Limpiando node_modules ==="
	rm -rf node_modules package-lock.json

# Iniciar aplicación en modo producción
.PHONY: start
start:
	$(NPM) start

# Iniciar aplicación en modo desarrollo (EL MÁS IMPORTANTE)
.PHONY: dev
dev:
	$(NPM) run dev

# === Comandos de Docker ===

# (TODO EN UNO) Construir Y ejecutar
.PHONY: docker-up
docker-up: docker-stop
	@echo "=== 1. Construyendo imagen: $(IMAGE_NAME) ==="
	docker build -t $(IMAGE_NAME) .
	@echo "=== 2. Levantando contenedor: $(CONTAINER_NAME) ==="
	docker run -d -p 3000:3000 $(ENV_FILE) --name $(CONTAINER_NAME) $(IMAGE_NAME)

# Construir la imagen (puedes borrarlo, 'docker-up' ya lo hace)
.PHONY: docker-build
docker-build:
	@echo "=== Construyendo imagen Docker: $(IMAGE_NAME) ==="
	docker build -t $(IMAGE_NAME) .

# Detener y eliminar el contenedor
.PHONY: docker-stop
docker-stop:
	@echo "=== Deteniendo y eliminando contenedor: $(CONTAINER_NAME) ==="
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

# Ver logs del contenedor
.PHONY: docker-logs
docker-logs:
	@echo "=== Mostrando logs de: $(CONTAINER_NAME) ==="
	docker logs -f $(CONTAINER_NAME)