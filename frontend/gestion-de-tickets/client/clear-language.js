// Script para limpiar el idioma del localStorage y forzar español
localStorage.removeItem("locale");
localStorage.removeItem("userSettings");
console.log("Idioma limpiado, se reiniciará en español");
