import { Box, DialogHeaderProps, DialogProps, Dialog as PrimerDialog } from "@primer/react";
import { PropsWithChildren, ReactNode, useId, useRef, useState } from "react";

export function MDialog<E extends HTMLElement>({
  trigger,
  children,
  title,
  dialogProps,
  headerProps,
}: PropsWithChildren<{
  trigger: (isOpen: ReactStateIO<boolean>, ref: React.RefObject<E>) => ReactNode;
  title?: ReactNode;
  headerProps?: Partial<DialogHeaderProps>;
  dialogProps?: Partial<DialogProps>;
}>) {
  const [isOpen, setIsOpen] = useState(false);
  const headerId = useId();
  const returnFocusRef = useRef<E | null>(null);
  return (
    <>
      {trigger({ get: isOpen, set: setIsOpen }, returnFocusRef)}
      <PrimerDialog returnFocusRef={returnFocusRef} isOpen={isOpen} onDismiss={() => setIsOpen(false)} aria-labelledby={headerId} {...dialogProps}>
        {title && (
          <PrimerDialog.Header id={headerId} {...headerProps}>
            {title}
          </PrimerDialog.Header>
        )}
        <Box p={3}>{children}</Box>
      </PrimerDialog>
    </>
  );
}
