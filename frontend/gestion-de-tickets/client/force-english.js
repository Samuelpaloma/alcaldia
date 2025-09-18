// Script para forzar inglés y limpiar cache
localStorage.setItem("locale", "en");
localStorage.removeItem("userSettings");
console.log("Idioma forzado a inglés, recarga la página");
