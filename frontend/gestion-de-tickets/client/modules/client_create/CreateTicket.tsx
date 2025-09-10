import "./CreateTicket.css";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import { createTicket, Priority } from "../client_tickets/store";

interface SenaOption {
  id: string;
  title: string;
  description?: string;
  children?: SenaOption[];
}

interface ChatMessage {
  type: 'question' | 'selection' | 'freeText';
  content: string;
  options?: SenaOption[];
  selectedOption?: SenaOption;
}

const SENA_AREAS: SenaOption[] = [
  {
    id: 'admissions',
    title: 'Admisiones',
    children: [
      {
        id: 'enrollment_inquiry',
        title: 'Consulta sobre inscripción',
        children: [
          { id: 'general_requirements', title: 'Requisitos generales' },
          { id: 'dates', title: 'Fechas' },
          { id: 'required_documents', title: 'Documentos necesarios' }
        ]
      },
      {
        id: 'enrollment_modification',
        title: 'Modificación de inscripción',
        children: [
          { id: 'change_program', title: 'Cambiar programa' },
          { id: 'change_modality', title: 'Cambiar modalidad' }
        ]
      }
    ]
  },
  {
    id: 'training_programs',
    title: 'Programas de Formación',
    children: [
      {
        id: 'available_courses',
        title: 'Cursos disponibles',
        children: [
          { id: 'technical', title: 'Técnico' },
          { id: 'technological', title: 'Tecnólogo' },
          { id: 'specialization', title: 'Especialización' }
        ]
      },
      {
        id: 'competency_certification',
        title: 'Certificación de competencias',
        children: [
          { id: 'request_certificate', title: 'Solicitar certificado' },
          { id: 'competency_validation', title: 'Validación de competencias' }
        ]
      }
    ]
  },
  {
    id: 'technical_support',
    title: 'Soporte Técnico',
    children: [
      {
        id: 'sofia_platform',
        title: 'Plataforma SOFIA',
        children: [
          { id: 'access_problems', title: 'Problemas de acceso' },
          { id: 'password_recovery', title: 'Recuperar contraseña' },
          { id: 'enrollment_errors', title: 'Error en inscripciones' }
        ]
      },
      {
        id: 'equipment_labs',
        title: 'Equipos y laboratorios',
        children: [
          { id: 'request_maintenance', title: 'Solicitar mantenimiento' },
          { id: 'report_failure', title: 'Reportar fallo' }
        ]
      }
    ]
  },
  {
    id: 'others',
    title: 'Otros',
    children: [
      { id: 'general_questions', title: 'Preguntas generales' },
      { id: 'suggestions_complaints', title: 'Sugerencias / Quejas' }
    ]
  }
];

export default function CreateTicket() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [fileName, setFileName] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string>("");
  
  // Guided chat state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentOptions, setCurrentOptions] = useState<SenaOption[]>(SENA_AREAS);
  const [selectedPath, setSelectedPath] = useState<SenaOption[]>([]);
  const [showFreeText, setShowFreeText] = useState(false);
  const [freeTextMessage, setFreeTextMessage] = useState("");

  useEffect(() => {
    if (chatHistory.length === 0 && currentOptions.length > 0) {
      setChatHistory([{
        type: 'question',
        content: '¿En qué área necesitas ayuda?',
        options: SENA_AREAS
      }]);
    }
  }, []);

  const handleOptionSelect = (option: SenaOption) => {
    const newSelectedPath = [...selectedPath, option];
    setSelectedPath(newSelectedPath);
    
    setChatHistory(prev => [...prev, {
      type: 'selection',
      content: option.title,
      selectedOption: option
    }]);

    if (option.children && option.children.length > 0) {
      setCurrentOptions(option.children);
      setChatHistory(prev => [...prev, {
        type: 'question',
        content: `¿Qué específicamente sobre "${option.title}"?`,
        options: option.children
      }]);
    } else {
      const pathString = newSelectedPath.map(p => p.title).join(' → ');
      setMessage(pathString);
      setCurrentOptions([]);
    }
  };

  const handleNotFoundCase = () => {
    setShowFreeText(true);
    setChatHistory(prev => [...prev, {
      type: 'freeText',
      content: 'No encontré mi caso específico'
    }]);
  };

  const resetChat = () => {
    setChatHistory([]);
    setCurrentOptions(SENA_AREAS);
    setSelectedPath([]);
    setShowFreeText(false);
    setFreeTextMessage("");
    setMessage("");
  };

  const getFormattedMessage = () => {
    if (showFreeText && freeTextMessage) {
      const pathString = selectedPath.length > 0 
        ? `Ruta seleccionada: ${selectedPath.map(p => p.title).join(' → ')}\n\nMensaje: ${freeTextMessage}`
        : freeTextMessage;
      return pathString;
    }
    return message;
  };

  const canSubmit = name && location && (message || (showFreeText && freeTextMessage)) && priority && !isLoading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulación de procesamiento (2-3 segundos)
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const finalMessage = getFormattedMessage();
    const tkt = createTicket({ name, location, message: finalMessage, priority, attachmentName: fileName });
    setCreatedTicketId(tkt.id);
    setIsLoading(false);
    setShowSuccessModal(true);
    
    // Limpiar formulario
    setName(""); 
    setLocation(""); 
    setMessage(""); 
    setPriority("medium"); 
    setFileName(undefined);
    resetChat();
  };

  return (
    <div className="section grid gap-6">
      <div>
        <h1 className="page-title">{t("client.create_ticket_panel")}</h1>
        <p className="page-subtitle">{t("client.create_ticket_desc")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">{t("client.create_ticket")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
            <label className="grid gap-1">
              <span className="label">{t("client.form.name")}</span>
              <Input value={name} onChange={(e)=>setName(e.target.value)} />
            </label>
            <label className="grid gap-1">
              <span className="label">{t("client.form.location")}</span>
              <Input value={location} onChange={(e)=>setLocation(e.target.value)} />
            </label>
            <div className="grid gap-1 md:col-span-2">
              <span className="label">Describe tu consulta</span>
              
              {/* Chat History */}
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[200px] max-h-[400px] overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="mb-4">¿En qué podemos ayudarte hoy?</p>
                    <p className="text-sm">Selecciona el área que mejor describe tu consulta:</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        msg.type === 'selection' 
                          ? 'bg-blue-100 text-blue-800 ml-8' 
                          : msg.type === 'freeText'
                          ? 'bg-green-100 text-green-800 ml-8'
                          : 'bg-white text-gray-700'
                      }`}>
                        <div className="font-medium">
                          {msg.type === 'selection' ? '✓ ' : msg.type === 'freeText' ? '✏️ ' : '🤖 '}
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Current Options */}
                {currentOptions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {currentOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleOptionSelect(option)}
                        className="w-full text-left p-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{option.title}</div>
                        {option.description && (
                          <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                        )}
                      </button>
                    ))}
                    
                    <button
                      type="button"
                      onClick={handleNotFoundCase}
                      className="w-full text-left p-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                    >
                      <div className="font-medium">No encuentro mi caso específico</div>
                      <div className="text-sm mt-1">Escribir mensaje personalizado</div>
                    </button>
                  </div>
                )}
                
                {/* Free Text Input */}
                {showFreeText && (
                  <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Describe tu consulta específica:
                    </label>
                    <textarea
                      value={freeTextMessage}
                      onChange={(e) => setFreeTextMessage(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      placeholder="Escribe aquí tu consulta detallada..."
                    />
                  </div>
                )}
                
                {/* Selected Path Summary */}
                {(message || (showFreeText && freeTextMessage)) && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800 mb-2">Resumen de tu consulta:</div>
                    <div className="text-sm text-green-700">
                      {showFreeText && freeTextMessage ? (
                        <div>
                          {selectedPath.length > 0 && (
                            <div className="mb-2">
                              <strong>Categoría:</strong> {selectedPath.map(p => p.title).join(' → ')}
                            </div>
                          )}
                          <div><strong>Mensaje:</strong> {freeTextMessage}</div>
                        </div>
                      ) : (
                        <div><strong>Categoría seleccionada:</strong> {message}</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Reset Button */}
                {(chatHistory.length > 0 || message || showFreeText) && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={resetChat}
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Reiniciar conversación
                    </button>
                  </div>
                )}
              </div>
            </div>
            <label className="grid gap-1">
              <span className="label">{t("client.form.priority")}</span>
              <select className="generic-select" value={priority} onChange={(e)=>setPriority(e.target.value as Priority)}>
                <option value="high">{t("tickets.priority.high")}</option>
                <option value="medium">{t("tickets.priority.medium")}</option>
                <option value="low">{t("tickets.priority.low")}</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="label">{t("client.form.attach")}</span>
              <input type="file" onChange={(e)=>setFileName(e.target.files?.[0]?.name)} />
              {fileName && <span className="text-xs text-muted-foreground">{fileName}</span>}
            </label>
            <div className="md:col-span-2">
              <Button disabled={!canSubmit} className="btn-contrast">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  t("client.submit_ticket")
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal de éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¡Ticket enviado correctamente!
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Tu ticket se ha creado exitosamente. ID del ticket: <strong>{createdTicketId}</strong>
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
