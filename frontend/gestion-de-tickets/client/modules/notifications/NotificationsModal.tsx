import { useState } from "react";
import { Bell, X, Filter, Check, Trash2, Clock, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/i18n";
import { useNotifications } from "@/hooks/use-notifications";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const { t } = useI18n();
  const {
    notifications,
    unreadCount,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    markAsRead,
    markAllAsRead,
    removeNotification,
    removeAllRead
  } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return 'Normal';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{t("notifications.title")}</h2>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} {t("notifications.unread")}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("notifications.filter")}</span>
            </div>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all" className="text-foreground hover:bg-muted">{t("notifications.all")}</SelectItem>
                <SelectItem value="unread" className="text-foreground hover:bg-muted">{t("notifications.unread_only")}</SelectItem>
                <SelectItem value="ticket" className="text-foreground hover:bg-muted">{t("notifications.tickets")}</SelectItem>
                <SelectItem value="system" className="text-foreground hover:bg-muted">{t("notifications.system")}</SelectItem>
                <SelectItem value="security" className="text-foreground hover:bg-muted">{t("notifications.security")}</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="newest" className="text-foreground hover:bg-muted">{t("notifications.newest")}</SelectItem>
                <SelectItem value="oldest" className="text-foreground hover:bg-muted">{t("notifications.oldest")}</SelectItem>
                <SelectItem value="priority" className="text-foreground hover:bg-muted">{t("notifications.priority")}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-1 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 text-xs bg-background border-input text-foreground hover:bg-muted"
                disabled={unreadCount === 0}
              >
                <Check className="w-3 h-3 mr-1" />
                {t("notifications.mark_all")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={removeAllRead}
                className="h-8 text-xs bg-background border-input text-foreground hover:bg-muted"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                {t("notifications.clear_read")}
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">{t("notifications.no_notifications")}</h3>
              <p className="text-sm text-muted-foreground">
                {filter === 'unread' 
                  ? t("notifications.no_unread")
                  : t("notifications.no_filter_match")
                }
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`bg-card border-border transition-all duration-200 hover:shadow-md ${
                    !notification.read ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(notification.priority)}`}
                            >
                              {getPriorityText(notification.priority)}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(notification.timestamp)}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 px-2 text-xs text-primary hover:bg-primary/10"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                {t("notifications.mark_read")}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeNotification(notification.id)}
                              className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {notifications.length} {notifications.length !== 1 ? t("notifications.notifications") : t("notifications.notification")} 
              {unreadCount > 0 && ` (${unreadCount} ${t("notifications.unread")})`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-7 text-xs bg-background border-input text-foreground hover:bg-muted"
            >
              {t("notifications.close")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}