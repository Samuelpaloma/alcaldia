#!/bin/bash

echo "========================================"
echo "    MONITOR DE LOGS DE REPORTES"
echo "========================================"
echo ""
echo "Este script monitorea los logs de reportes en tiempo real"
echo "Presiona Ctrl+C para salir"
echo ""

# Crear directorio de logs si no existe
mkdir -p logs

echo "Iniciando monitoreo de logs..."
echo ""

# Monitorear logs en tiempo real
tail -f logs/reports-debug.log
