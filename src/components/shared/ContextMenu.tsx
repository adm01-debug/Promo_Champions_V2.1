import { FC, ReactNode } from 'react';
import {
  ContextMenu as RadixContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  trigger: ReactNode;
  items: ContextMenuItem[];
  className?: string;
}

export const ContextMenu: FC<ContextMenuProps> = ({
  trigger,
  items,
  className,
}) => {
  const renderMenuItem = (item: ContextMenuItem) => {
    if (item.submenu && item.submenu.length > 0) {
      return (
        <ContextMenuSub key={item.id}>
          <ContextMenuSubTrigger className="gap-2" disabled={item.disabled}>
            {item.icon}
            {item.label}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {item.submenu.map(subItem => renderMenuItem(subItem))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      );
    }

    return (
      <ContextMenuItem
        key={item.id}
        onClick={item.onClick}
        disabled={item.disabled}
        className={cn(
          "gap-2",
          item.destructive && "text-destructive focus:text-destructive"
        )}
      >
        {item.icon}
        {item.label}
        {item.shortcut && <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>}
      </ContextMenuItem>
    );
  };

  return (
    <RadixContextMenu>
      <ContextMenuTrigger asChild className={className}>
        {trigger}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {items.map((item, index) => (
          <div key={item.id}>
            {renderMenuItem(item)}
            {index < items.length - 1 && item.id.includes('separator') && (
              <ContextMenuSeparator />
            )}
          </div>
        ))}
      </ContextMenuContent>
    </RadixContextMenu>
  );
};
