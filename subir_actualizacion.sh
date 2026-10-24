#!/bin/bash
set -e

cd ~/contable-pro-max

# 1. Agregar absolutamente todo (modificados y no rastreados)
git add -A

# 2. Hacer commit con la actualización real
git commit -m "Actualización v2: Nuevos componentes acceso, alta, sync y librerías de conexión"

# 3. Subir a GitHub
git push origin main

echo "----------------------------------------"
echo "¡Segunda actualización subida con éxito a GitHub!"
echo "----------------------------------------"
