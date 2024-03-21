import { Button } from "@primer/react";
import { useRef } from "react";

export function LoadFilesButton({
  onLoad,
  selectDir,
  inputProps,
}: {
  onLoad: (files: FileList | null) => void;
  selectDir?: boolean;
  inputProps?: Partial<React.InputHTMLAttributes<HTMLInputElement>>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <Button variant={"primary"} onClick={() => inputRef.current?.click()}>
        Load files
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
