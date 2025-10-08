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
import { api, CategoriaSimpleDTO } from "../../../shared/api";
import { Bot, Building, Calculator, Users, Folder, Monitor, Database, Wifi, Code, Wrench, Shield, User, MessageSquare, Info, FileText, Upload, Send, CheckCircle, AlertCircle, Clock, X, Loader2, Tag } from "lucide-react";

interface SenaOption {
  id: string;
  title: string;
  description?: string;
  children?: SenaOption[];
  icon?: React.ComponentType<{ className?: string }>;
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
  
  // Estado para categorías dinámicas
  const [dynamicCategories, setDynamicCategories] = useState<CategoriaSimpleDTO[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Función para cargar categorías dinámicamente
  const loadDynamicCategories = async () => {
    try {
      setCategoriesLoading(true);
      const categories = await api.getCategoriasActivas();
      setDynamicCategories(categories);
      console.log('📋 Categorías cargadas dinámicamente:', categories);
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      });
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Función para obtener el icono apropiado según el nombre de la categoría
  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('administración') || name.includes('gestión')) return Building;
    if (name.includes('contabilidad') || name.includes('financiero')) return Calculator;
    if (name.includes('recursos humanos') || name.includes('personal')) return Users;
    if (name.includes('documental') || name.includes('archivo')) return Folder;
    if (name.includes('tecnología') || name.includes('informática') || name.includes('sistemas')) return Monitor;
    if (name.includes('redes') || name.includes('comunicaciones')) return Wifi;
    if (name.includes('desarrollo') || name.includes('software')) return Code;
    if (name.includes('infraestructura') || name.includes('mantenimiento')) return Wrench;
    if (name.includes('atención') || name.includes('ciudadano') || name.includes('servicio')) return User;
    if (name.includes('quejas') || name.includes('reclamos')) return MessageSquare;
    if (name.includes('información') || name.includes('consulta')) return Info;
    if (name.includes('tramites') || name.includes('procedimientos')) return FileText;
    if (name.includes('seguridad')) return Shield;
    
    // Icono por defecto
    return Tag;
  };

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadDynamicCategories();
  }, []);

  // Generate SENA areas using dynamic categories - regenerates when categories or language changes
  const SENA_AREAS: SenaOption[] = useMemo(() => {
    console.log("Regenerando SENA_AREAS con categorías dinámicas:", dynamicCategories);
    
    if (dynamicCategories.length === 0) {
      // Fallback a categorías básicas si no hay categorías dinámicas
      return [
        {
          id: "general",
          title: "General",
          description: "Categoría general para consultas",
          icon: Info
        }
      ];
    }

    // Convertir categorías dinámicas al formato SenaOption
    return dynamicCategories.map((category) => ({
      id: category.id.toString(),
      title: category.nombre,
      description: category.descripcion || `Categoría: ${category.nombre}`,
      icon: getIconForCategory(category.nombre)
    }));
  }, [dynamicCategories, t, locale]); // Regenera cuando cambian las categorías o el idioma
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    // Prioridad 1: Si hay mensaje personalizado (texto libre), usarlo como descripción principal
    if (showFreeText && freeTextMessage) {
      const pathString = selectedPath.length > 0 
        ? `${t("client.chat.selected_category")} ${selectedPath.map(p => p.title).join(' → ')}\n\n${t("client.chat.message")} ${freeTextMessage}`
        : freeTextMessage;
      return pathString;
    }
    
    // Prioridad 2: Si hay mensaje directo en el campo, usarlo
    if (message && message.trim()) {
      const categoryPath = selectedPath.length > 0 
        ? `${t("client.chat.selected_category")} ${selectedPath.map(p => p.title).join(' → ')}\n\n${t("client.chat.message")} ${message}`
        : message;
      return categoryPath;
    }
    
    // Prioridad 3: Si es una categoría seleccionada del bot sin mensaje personalizado, usar la descripción específica
    if (selectedPath.length > 0) {
      const lastOption = selectedPath[selectedPath.length - 1];
      const categoryPath = selectedPath.map(p => p.title).join(' → ');
      
      // Si tiene descripción específica, usarla; si no, usar el título
      const problemDescription = lastOption.description || lastOption.title;
      
      return `${t("client.chat.selected_category")} ${categoryPath}\n\n${t("client.chat.problem_description")} ${problemDescription}`;
    }
    
    return 'Consulta General';
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

  // Función para convertir archivo a Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remover el prefijo "data:image/jpeg;base64," para obtener solo el Base64
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

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
        priority,
        hasFile: !!selectedFile
      });
      
      // Preparar datos del ticket
      const ticketData: any = { 
        name, 
        location, 
        message: finalMessage,
        subject,
        category,
        priority
      };

      // Si hay archivo seleccionado, convertirlo a Base64
      if (selectedFile) {
        try {
          console.log('🔍 [DEBUG] Procesando archivo:', selectedFile.name, 'Tamaño:', selectedFile.size);
          const base64Content = await fileToBase64(selectedFile);
          ticketData.archivoAdjunto = base64Content;
          ticketData.nombreArchivo = selectedFile.name;
          ticketData.attachmentName = selectedFile.name;
          console.log('✅ [DEBUG] Archivo convertido a Base64:', selectedFile.name, 'Longitud Base64:', base64Content.length);
        } catch (fileError) {
          console.error('❌ [DEBUG] Error procesando archivo:', fileError);
          toast({
            title: t("client.error"),
            description: "Error al procesar el archivo adjunto",
            variant: "destructive",
          });
          return;
        }
      } else {
        console.log('🔍 [DEBUG] No hay archivo seleccionado');
      }
      
      const tkt = await createTicket(ticketData);
      
      setCreatedTicketId(tkt.id);
      setShowSuccessModal(true);
      
      // Limpiar solo los campos del ticket, mantener datos del usuario
      setMessage(""); 
      setPriority("medium"); 
      setSelectedFile(null);
      setFileName(undefined);
      resetChat();
      
      // Toast removido para evitar interferencia con notificaciones
      console.log("Ticket creado exitosamente:", tkt.id);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      // Toast de error removido para evitar interferencia con notificaciones
      alert(error instanceof Error ? error.message : t("client.create_error"));
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
            </label>
            <label className="grid gap-1">
              <span className="label text-sm flex items-center gap-2">
                {t("client.form.location")}
                <div className="group relative">
                  <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Para cambiar el departamento o área, dirígete a Configuración → Perfil → Ubicación, y selecciona el área donde actualmente te encuentras.
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </span>
              <Input 
                value={location} 
                disabled={true}
                className="bg-muted"
                placeholder={userLoading ? t("client.loading") : ""}
              />
              {userLoading && <span className="text-xs text-muted-foreground">{t("client.loading_user_info")}</span>}
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
                        <div className="flex items-center gap-3">
                          {option.icon && (
                            <div className="flex-shrink-0">
                              <option.icon className="h-5 w-5 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground">{option.title}</div>
                            {option.description && (
                              <div className="text-sm text-muted-foreground mt-1">{option.description}</div>
                            )}
                          </div>
                        </div>
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
                    <span
                      onClick={resetChat}
                      className="text-sm underline cursor-pointer"
                      style={{ 
                        color: '#007bff',
                        backgroundColor: 'transparent', 
                        border: 'none', 
                        padding: 0,
                        outline: 'none',
                        boxShadow: 'none',
                        background: 'none',
                        backgroundImage: 'none',
                        backgroundSize: 'none',
                        backgroundPosition: 'none',
                        backgroundRepeat: 'none',
                        display: 'inline-block'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#0056b3'}
                      onMouseLeave={(e) => e.target.style.color = '#007bff'}
                    >
                      {t("client.chat.reset")}
                    </span>
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
              <div className="relative">
                <input 
                  type="file" 
                  id="file-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Validar tamaño (10MB)
                      if (file.size > 10 * 1024 * 1024) {
                        toast({
                          title: "Error",
                          description: "El archivo no puede ser mayor a 10MB",
                          variant: "destructive",
                        });
                        return;
                      }
                      setSelectedFile(file);
                      setFileName(file.name);
                    } else {
                      setSelectedFile(null);
                      setFileName(undefined);
                    }
                  }}
                  accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.zip,.rar,.7z,.mp4,.avi,.mov,.wmv,.mp3,.wav,.ogg"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                />
                <div className="bg-background border-input text-foreground rounded-md px-3 py-2 border flex items-center justify-between">
                  <span className="text-sm">
                    {fileName ? fileName : t("client.select_file")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {fileName ? "✓" : "📁"}
                  </span>
                </div>
              </div>
              {!fileName && (
                <div className="text-xs text-muted-foreground">
                  {t("client.no_files_selected")}
                </div>
              )}
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