import { Box, Text } from "@primer/react";
import React, { useEffect, useImperativeHandle } from "react";

type Props = {
  file?: File;
  label?: React.ReactNode;
  play?: boolean;
  progress?: number;
  playbackRate?: number;
  native?: React.VideoHTMLAttributes<HTMLVideoElement>;
};

export type VideoProps = Props;

type Ref = {
  play(): void;
};

export type VideoRef = Ref;

export const Video = React.forwardRef<Ref, Props>(function Video({ file, label, playbackRate = 1, native, play, progress }, ref) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [error, setError] = React.useState<MediaError | null>(null);

  useImperativeHandle(ref, () => ({
    play() {},
  }));

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleError = (): void => {
        console.error(`Video error on ${label}`, video.error);
        setError(video.error);
      };
      video.addEventListener("error", handleError);
      return () => {
        video.removeEventListener("error", handleError);
      };
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (file) {
        setError(null);
        video.src = URL.createObjectURL(file);
        video.playbackRate = playbackRate;
      } else {
        video.src = "";
      }
    }
  }, [file]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && playbackRate) video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const video = videoRef.current;
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
    const video = videoRef.current;
    if (video && progress !== undefined && video.readyState >= video.HAVE_METADATA) {
      const time = video.duration * progress;
      video.currentTime = time;
    }
  }, [progress]);

  return (
    <Box position="relative" display="flex" flexDirection="column" sx={{ gap: 0 }}>
      {error && (
        <Box position="absolute" background="#fefefeaa" px={1}>
          <Text sx={{ color: "fg-attention" }}>{friendlyFormatErrorMessage(error)}</Text>
        </Box>
      )}
      <Box sx={{ backgroundColor: error ? "neutral.emphasis" : undefined }}>
        <video ref={videoRef} playsInline onContextMenu={(e) => e.preventDefault()} {...native} style={{ width: "100%", ...native?.style }} />
      </Box>
      <Box display="flex" justifyContent="center">
        <Text as="label" sx={{ color: "fg.neutral" }}>
          {label}
        </Text>
      </Box>
    </Box>
  );
});

function friendlyFormatErrorMessage(error: MediaError): React.ReactNode {
  return error.message === "MEDIA_ELEMENT_ERROR: Empty src attribute" ? "File not found" : error.message;
}
