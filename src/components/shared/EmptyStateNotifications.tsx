import {FC} from 'react';
import {Bell} from 'lucide-react';
export const EmptyStateNotifications:FC=()=>{return <div className="flex flex-col items-center p-8"><Bell className="h-12 w-12"/><h3>Sem notificações</h3></div>;};