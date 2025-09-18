import { LogOut, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export default function LogoutModal({ isOpen, onClose, onConfirm, userName }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <LogOut className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Cerrar sesión</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {userName ? `¿Estás seguro de que quieres cerrar sesión, ${userName}?` : 
             '¿Estás seguro de que quieres cerrar sesión?'}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>Se perderán los cambios no guardados</span>
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={onConfirm}
              className="flex-1 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

