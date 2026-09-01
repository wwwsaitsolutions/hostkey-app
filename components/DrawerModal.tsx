'use client';

import React from 'react';
import { Drawer } from 'vaul';
import { X } from 'lucide-react';

interface DrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const DrawerModal: React.FC<DrawerModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-slate-900 border-t border-white/10 flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 max-h-[85vh] z-50 focus:outline-none">
          {/* Top handle bar for dragging */}
          <div className="p-4 bg-slate-900 rounded-t-[32px] flex-shrink-0 flex flex-col items-center">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mb-3" />
            <div className="w-full flex items-center justify-between px-2">
              <Drawer.Title className="font-bold text-lg text-white">
                {title}
              </Drawer.Title>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/5 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Body Content */}
          <div className="p-4 overflow-y-auto flex-1 text-slate-200">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};