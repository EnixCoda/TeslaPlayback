import { ChevronDownIcon, ChevronUpIcon } from "@primer/octicons-react";
import { Button, ButtonProps } from "@primer/react";
import { FC, PropsWithChildren, useState } from "react";

export const ExpandButton: FC<PropsWithChildren<{ buttonProps?: ButtonProps }>> = function ExpandButton({ buttonProps, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        {...buttonProps}
        trailingVisual={isOpen ? ChevronUpIcon : ChevronDownIcon}
        onClick={(e) => {
          buttonProps?.onClick?.(e);
          setIsOpen(!isOpen);
        }}
      >
        {buttonProps?.children ?? "Toggle"}
      </Button>
      {isOpen && children}
    </>
  );
};
