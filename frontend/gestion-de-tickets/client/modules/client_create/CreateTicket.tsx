import "./CreateTicket.css";
import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n";
import { createTicket, Priority } from "../client_tickets/apiStore";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useUserInfo } from "@/hooks/use-user-info";
import { Bot } from "lucide-react"; // Added for bot icon

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


export default function CreateTicket() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const { profile, isLoading: userLoading, error: userError } = useUserProfile();
  const { userInfo, isLoading: userInfoLoading, error: userInfoError } = useUserInfo();

  // Generate SENA areas using translations - regenerates when language changes
  const SENA_AREAS: SenaOption[] = useMemo(() => {
    console.log("Regenerando SENA_AREAS para idioma:", locale);
    return [
      {
        id: "administracion",
        title: t("sena.administration"),
        description: t("sena.administration.desc"),
        children: [
          {
            id: "contabilidad",
            title: t("sena.accounting"),
            description: t("sena.accounting.desc")
          },
          {
            id: "recursos_humanos",
            title: t("sena.human_resources"),
            description: t("sena.human_resources.desc")
          },
          {
            id: "gestion_documental",
            title: t("sena.document_management"),
            description: t("sena.document_management.desc")
          }
        ]
      },
      {
        id: "tecnologia",
        title: t("sena.technology"),
        description: t("sena.technology.desc"),
        children: [
          {
            id: "sistemas",
            title: t("sena.information_systems"),
            description: t("sena.information_systems.desc")
          },
          {
            id: "redes",
            title: t("sena.networks"),
            description: t("sena.networks.desc")
          },
          {
            id: "desarrollo",
            title: t("sena.development"),
            description: t("sena.development.desc")
          }
        ]
      },
      {
        id: "infraestructura",
        title: t("sena.infrastructure"),
        description: t("sena.infrastructure.desc"),
        children: [
          {
            id: "mantenimiento",
            title: t("sena.maintenance"),
            description: t("sena.maintenance.desc")
          },
          {
            id: "limpieza",
            title: t("sena.cleaning"),
            description: t("sena.cleaning.desc")
          },
          {
            id: "seguridad",
            title: t("sena.security"),
            description: t("sena.security.desc")
          }
        ]
      },
      {
        id: "atencion_ciudadana",
        title: t("sena.citizen_service"),
        description: t("sena.citizen_service.desc"),
        children: [
          {
            id: "tramites",
            title: t("sena.procedures"),
            description: t("sena.procedures.desc")
          },
          {
            id: "quejas",
            title: t("sena.complaints"),
            description: t("sena.complaints.desc")
          },
          {
            id: "informacion",
            title: t("sena.information"),
            description: t("sena.information.desc")
          }
        ]
      }
    ];
  }, [t, locale]); // Regenera cuando cambia el idioma
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [fileName, setFileName] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string>("");

  // Actualizar nombre y ubicación cuando se obtenga la información del usuario
  useEffect(() => {
    console.log('🔄 Actualizando datos del formulario:', { profile, userInfo });
    
    if (profile) {
      const fullName = `${profile.nombre} ${profile.apellido}`.trim();
      const ubicacion = profile.ubicacion || profile.departamento;
      const finalLocation = ubicacion && ubicacion !== 'No especificada' && ubicacion !== 'No especificado' 
        ? ubicacion 
        : 'Departamento de Sistemas';
      
      console.log('📝 Datos del perfil:', {
        nombre: fullName,
        ubicacion: profile.ubicacion,
        departamento: profile.departamento,
        ubicacionFinal: finalLocation
      });
      
      setName(fullName);
      setLocation(finalLocation);
    } else if (userInfo) {
      // Fallback a userInfo si profile no está disponible
      const ubicacion = userInfo.ubicacion || userInfo.departamento;
      const finalLocation = ubicacion && ubicacion !== 'No especificada' && ubicacion !== 'No especificado' 
        ? ubicacion 
        : 'Departamento de Sistemas';
      
      console.log('📝 Datos del userInfo:', {
        nombre: userInfo.nombre,
        ubicacion: userInfo.ubicacion,
        departamento: userInfo.departamento,
        ubicacionFinal: finalLocation
      });
      
      setName(userInfo.nombre);
      setLocation(finalLocation);
    } else {
      // Si no se puede obtener información del usuario, usar valores por defecto
      console.warn('⚠️ No se pudo obtener información del usuario, usando valores por defecto');
      setName('Usuario');
      setLocation('Departamento de Sistemas');
    }
  }, [profile, userInfo]);
  
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
        content: t("client.chat.welcome"),
        options: SENA_AREAS
      }]);
    }
  }, [t]);

  // Reset chat when language changes
  useEffect(() => {
    console.log("Idioma cambiado a:", locale);
    setChatHistory([{
      type: 'question',
      content: t("client.chat.welcome"),
      options: SENA_AREAS
    }]);
    setCurrentOptions(SENA_AREAS);
    setSelectedPath([]);
    setShowFreeText(false);
    setFreeTextMessage("");
    setMessage("");
  }, [locale, t, SENA_AREAS]);

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
            content: `${t("client.chat.specific_query")} "${option.title}"?`,
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
      content: t("client.chat.not_found")
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
        ? `${t("client.chat.selected_category")} ${selectedPath.map(p => p.title).join(' → ')}\n\n${t("client.chat.message")} ${freeTextMessage}`
        : freeTextMessage;
      return pathString;
    }
    return message;
  };

  const getSubject = () => {
    if (showFreeText && freeTextMessage) {
      // Extraer las primeras palabras como asunto
      const words = freeTextMessage.trim().split(' ');
      return words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '');
    }
    if (message) {
      // Si es una categoría seleccionada, usar el título
      return selectedPath.length > 0 
        ? selectedPath[selectedPath.length - 1].title
        : message;
    }
    return 'Consulta General';
  };

  const getCategory = () => {
    if (selectedPath.length > 0) {
      return selectedPath[selectedPath.length - 1].title;
    }
    return 'General';
  };

  const canSubmit = name && location && (message || (showFreeText && freeTextMessage)) && priority && !isLoading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const finalMessage = getFormattedMessage();
      const subject = getSubject();
      const category = getCategory();
      
      console.log('🎫 Creando ticket:', {
        subject,
        category,
        message: finalMessage,
        priority
      });
      
      const tkt = await createTicket({ 
        name, 
        location, 
        message: finalMessage,
        subject,
        category,
        priority, 
        attachmentName: fileName 
      });
      
      setCreatedTicketId(tkt.id);
      setShowSuccessModal(true);
      
      // Limpiar formulario
      setName(""); 
      setLocation(""); 
      setMessage(""); 
      setPriority("medium"); 
      setFileName(undefined);
      resetChat();
      
      toast({
        title: t("client.chat.success_title"),
        description: t("client.chat.success_message") + " " + tkt.id,
      });
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: t("client.error"),
        description: error instanceof Error ? error.message : t("client.create_error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="section grid gap-4 p-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("client.create_ticket")}</h1>
        <p className="text-muted-foreground text-sm">{t("client.fill_form")}</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-card-foreground flex items-center gap-2">
            <Bot className="w-4 h-4" />
            {t("client.chat.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
            <label className="grid gap-1">
              <span className="label text-sm">{t("client.form.name")}</span>
              <Input 
                value={name} 
                disabled={true}
                className="bg-muted"
                placeholder={userLoading ? t("client.loading") : ""}
              />
              {userLoading && <span className="text-xs text-muted-foreground">{t("client.loading_user_info")}</span>}
              {!userLoading && <span className="text-xs text-muted-foreground">{t("client.auto_filled")}</span>}
            </label>
            <label className="grid gap-1">
              <span className="label text-sm">{t("client.form.location")}</span>
              <Input 
                value={location} 
                disabled={true}
                className="bg-muted"
                placeholder={userLoading ? t("client.loading") : ""}
              />
              {userLoading && <span className="text-xs text-muted-foreground">{t("client.loading_user_info")}</span>}
              {!userLoading && <span className="text-xs text-muted-foreground">{t("client.auto_filled")}</span>}
            </label>
            <div className="grid gap-1 md:col-span-2">
              <span className="label text-sm">{t("client.chat.describe_query")}</span>
              
              {/* Chat History */}
              <div className="border border-border rounded-lg p-4 bg-muted min-h-[200px] max-h-[400px] overflow-y-auto">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="mb-4 text-foreground">{t("client.chat.welcome")}</p>
                    <p className="text-sm text-muted-foreground">{t("client.chat.select_area")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`p-3 rounded-lg ${
                        msg.type === 'selection' 
                          ? 'bg-primary/10 text-primary ml-8 border border-primary/20' 
                          : msg.type === 'freeText'
                          ? 'bg-green-500/10 text-green-600 ml-8 border border-green-500/20'
                          : 'bg-background text-foreground'
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
                        className="w-full text-left p-3 border border-border rounded-lg hover:bg-primary/10 hover:border-primary transition-colors bg-background"
                      >
                        <div className="font-medium text-foreground">{option.title}</div>
                        {option.description && (
                          <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                        )}
                      </button>
                    ))}
                    
                    <button
                      type="button"
                      onClick={handleNotFoundCase}
                      className="w-full text-left p-3 border-2 border-dashed border-muted-foreground rounded-lg hover:bg-muted text-muted-foreground"
                    >
                      <div className="font-medium">{t("client.chat.not_found")}</div>
                      <div className="text-sm mt-1">{t("client.chat.custom_message")}</div>
                    </button>
                  </div>
                )}
                
                {/* Free Text Input */}
                {showFreeText && (
                  <div className="mt-4 space-y-2">
                    <label className="block text-sm font-medium text-foreground">
                      {t("client.chat.specific_query")}
                    </label>
                    <textarea
                      value={freeTextMessage}
                      onChange={(e) => setFreeTextMessage(e.target.value)}
                      className="w-full p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
                      rows={4}
                      placeholder={t("client.chat.placeholder")}
                    />
                  </div>
                )}
                
                {/* Selected Path Summary */}
                {(message || (showFreeText && freeTextMessage)) && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="font-medium text-green-600 mb-2">{t("client.chat.summary")}</div>
                    <div className="text-sm text-green-700">
                      {showFreeText && freeTextMessage ? (
                        <div>
                          {selectedPath.length > 0 && (
                            <div className="mb-2">
                              <strong>{t("client.chat.category")}</strong> {selectedPath.map(p => p.title).join(' → ')}
                            </div>
                          )}
                          <div><strong>{t("client.chat.message")}</strong> {freeTextMessage}</div>
                        </div>
                      ) : (
                        <div><strong>{t("client.chat.selected_category")}</strong> {message}</div>
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
                      className="text-sm text-primary hover:text-primary/80 underline"
                    >
                      {t("client.chat.reset")}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <label className="grid gap-1">
              <span className="label text-sm">{t("client.form.priority")}</span>
              <select className="generic-select" value={priority} onChange={(e)=>setPriority(e.target.value as Priority)}>
                <option value="high">{t("tickets.priority.high")}</option>
                <option value="medium">{t("tickets.priority.medium")}</option>
                <option value="low">{t("tickets.priority.low")}</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className="label text-sm">{t("client.form.attach")}</span>
              <input type="file" onChange={(e)=>setFileName(e.target.files?.[0]?.name)} className="bg-background border-input text-foreground rounded-md px-3 py-2" />
              {fileName && <span className="text-xs text-muted-foreground">{fileName}</span>}
            </label>
            <div className="md:col-span-2">
              <Button disabled={!canSubmit} className="btn-contrast">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t("client.chat.sending")}
                  </>
                ) : (
                  t("client.submit_ticket")
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 m-4 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 border border-green-200 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                {t("client.chat.success_title")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("client.chat.success_message")} <strong className="text-green-600">{createdTicketId}</strong>
              </p>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {t("client.chat.accept")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}