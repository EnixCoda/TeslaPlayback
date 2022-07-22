export function LoadFilesButton({ onLoad }: { onLoad: (files: FileList | null) => void }) {
  return (
    <button>
      <label>
        Load files
        <input
          type="file"
          style={{ visibility: "hidden", width: 0, height: 0 }}
          {...{ webkitdirectory: "true" }} // avoid type error
          multiple
          accept="video/mp4,video/x-m4v,video/*"
          onChange={(event) => onLoad(event.target.files)}
        />
      </label>
    </button>
  );
}
