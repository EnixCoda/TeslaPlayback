import { DialogHeaderProps, DialogProps } from "@primer/react";
import { Dialog as PrimerDialog } from "@primer/react/experimental";
import { PropsWithChildren, ReactNode, useRef, useState } from "react";

export function Dialog<E extends HTMLElement>({
  trigger,
  children,
  title,
  dialogProps,
}: PropsWithChildren<{
  trigger: (isOpen: ReactStateIO<boolean>, ref: React.RefObject<E>) => ReactNode;
  title?: ReactNode;
  headerProps?: Partial<DialogHeaderProps>;
  dialogProps?: Partial<DialogProps>;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const returnFocusRef = useRef<E | null>(null);
  return (
    <>
      {trigger({ get: isOpen, set: setIsOpen }, returnFocusRef)}
      {isOpen && (
        <PrimerDialog title={title} onClose={() => setIsOpen(false)} height="large" {...dialogProps}>
          {children}
        </PrimerDialog>
      )}
    </>
  );
}
