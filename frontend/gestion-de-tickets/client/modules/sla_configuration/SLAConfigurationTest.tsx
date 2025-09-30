import React from 'react';

export default function SLAConfigurationTest() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">✅ Configuración SLA</h1>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <p className="font-bold">¡Funcionando correctamente!</p>
        <p>La ruta /sla-configuration está funcionando.</p>
      </div>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Próximos pasos:</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Conectar con el backend</li>
          <li>Mostrar configuraciones SLA existentes</li>
          <li>Permitir crear nuevas configuraciones</li>
        </ul>
      </div>
    </div>
  );
}
