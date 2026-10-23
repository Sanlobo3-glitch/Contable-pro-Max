#!/bin/bash
set -e

# Ir a la carpeta del proyecto en Termux
cd ~/contable-pro-max

# Inicializar Git y configurar credenciales
git init
git config --global user.name "Sanlobo3-glitch"
git config --global user.email "richard.lobo.tachira@gmail.com"

# Agregar archivos y realizar commit
git add .
git commit -m "Primer commit: Subiendo Contable-pro-Max"

# Configurar rama remota y token
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin https://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@github.com/Sanlobo3-glitch/Contable-pro-Max.git

# Subir al repositorio
git push -u origin main

echo "----------------------------------------"
echo "¡Proyecto subido con éxito a GitHub!"
echo "----------------------------------------"
