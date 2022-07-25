import * as React from "react";
import { useEffect } from "react";

type Props = {
  file?: File;
  title?: React.ReactNode;
  play?: boolean;
  progress?: number;
  playbackRate?: number;
  native?: React.VideoHTMLAttributes<HTMLVideoElement>;
};

export function Video({ file, title, playbackRate = 1, native, play, progress }: Props) {
  const ref = React.useRef<HTMLVideoElement | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (video) {
      const handleError = (e: ErrorEvent): void => {
        console.error(`Video error on ${title}`, video.error);
        setError(e.error);
      };
      video.addEventListener("error", handleError);
      return () => {
        video.removeEventListener("error", handleError);
      };
    }
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (video && file) {
      setError(null);
      video.src = URL.createObjectURL(file);
      video.playbackRate = playbackRate;
    }
  }, [file]);

  useEffect(() => {
    const video = ref.current;
    if (video && playbackRate) video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const video = ref.current;
    if (video) {
      if (play)
        video.play().catch(() => {
          // catching here prevent raising to upper global scope
          // let native DOM event listener above handle error
        });
      else video.pause();
    }
  }, [play]);

  useEffect(() => {
    const video = ref.current;
    if (video && progress !== undefined && video.readyState >= video.HAVE_METADATA) {
      const time = video.duration * progress;
      video.currentTime = time;
    }
  }, [progress]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute" }}>
        {title}
        {error && <span>{error.message}</span>}
      </div>
      <video ref={ref} playsInline onContextMenu={(e) => e.preventDefault()} {...native} style={{ width: "100%", ...native?.style }} />
    </div>
  );
}
