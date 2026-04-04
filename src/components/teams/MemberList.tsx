import React from "react";
import { FC, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  UserPlus, 
  Search,
  Mail,
  Phone,
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'sdr' | 'closer' | 'manager';
  isActive: boolean;
}

interface MemberListProps {
  members: Member[];
  onMemberClick?: (member: Member) => void;
  onRemoveMember?: (member: Member) => void;
  onEditMember?: (member: Member) => void;
  showSearch?: boolean;
  className?: string;
}

const roleLabels = {
  sdr: { label: 'SDR', variant: 'secondary' as const },
  closer: { label: 'Closer', variant: 'default' as const },
  manager: { label: 'Gerente', variant: 'outline' as const },
};

export const MemberList: FC<MemberListProps> = ({
  members,
  onMemberClick,
  onRemoveMember,
  onEditMember,
  showSearch = true,
  className,
}) => {
  const [search, setSearch] = useState('');

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn('space-y-4', className)}>
      {showSearch && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar membro..."
            className="pl-9"
          />
        </div>
      )}

      <div className="space-y-2">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
            onClick={() => onMemberClick?.(member)}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{member.name}</p>
                <Badge variant={roleLabels[member.role].variant}>
                  {roleLabels[member.role].label}
                </Badge>
                {!member.isActive && (
                  <Badge variant="destructive">Inativo</Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Mail size={10} />
                  {member.email}
                </span>
                {member.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={10} />
                    {member.phone}
                  </span>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={e => e.stopPropagation()}
                >
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditMember?.(member)}>
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onRemoveMember?.(member)}
                  className="text-destructive"
                >
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum membro encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface AddMemberButtonProps {
  onClick?: () => void;
}

export const AddMemberButton: FC<AddMemberButtonProps> = ({ onClick }) => (
  <Button onClick={onClick} className="gap-2">
    <UserPlus size={16} />
    Adicionar Membro
  </Button>
);
