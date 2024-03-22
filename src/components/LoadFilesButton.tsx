import { Button } from "@primer/react";
import { PropsWithChildren, useRef } from "react";

export function LoadFilesButton({
  onLoad,
  selectDir,
  inputProps,
  children,
}: PropsWithChildren<{
  onLoad: (files: FileList | null) => void;
  selectDir?: boolean;
  inputProps?: Partial<React.InputHTMLAttributes<HTMLInputElement>>;
}>) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <Button variant={"primary"} onClick={() => inputRef.current?.click()}>
        {children}
      </Button>
      <input
        hidden
        ref={inputRef}
        type="file"
        {...(selectDir ? { webkitdirectory: "true" } : {})} // solve type error
        {...inputProps}
        style={{ visibility: "hidden", width: 0, height: 0 }}
        onChange={(event) => {
          onLoad(event.target.files);
          inputProps?.onChange?.(event);
        }}
      />
    </>
  );
}
