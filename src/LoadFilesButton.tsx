import { Button } from "@primer/react";
import { useRef } from "react";

export function LoadFilesButton({ onLoad }: { onLoad: (files: FileList | null) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <Button variant={'primary'} onClick={() => inputRef.current?.click()}>Load files</Button>
      <input
        hidden
        ref={inputRef}
        type="file"
        style={{ visibility: "hidden", width: 0, height: 0 }}
        {...{ webkitdirectory: "true" }} // avoid type error
        multiple
        accept="video/mp4,video/x-m4v,video/*"
        onChange={(event) => onLoad(event.target.files)}
      />
    </>
  );
}
