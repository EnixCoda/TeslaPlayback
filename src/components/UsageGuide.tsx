import { Heading } from "@primer/react";

export function UsageGuide() {
  return (
    <section>
      <Heading as="h2" sx={{ fontSize: 3 }}>
        How to use
      </Heading>
      <ol>
        <li>Disconnect the USB drive from your Tesla and connect it to your computer.</li>
        <li>Initiate the process by clicking the "Load files" button.</li>
        <li>
          Navigate to and select the USB drive or its root folder, which contains <em>TeslaCam</em>, <em>RecentClips</em>, <em>SavedClips</em>, or{" "}
          <em>SentryClips</em>.
          <p>
            Important: If your browser prompts a warning about file uploads, don't worry, no files will be uploaded. For added security, feel free to
            disconnect from internet before you proceed.
          </p>
        </li>
        <li>Upon selecting the correct folder, your Tesla's video files will automatically begin playback.</li>
      </ol>
      <p>Note: This web app is for 🖥️ 💻 computer usages (Windows/macOS/Linux). It might not work on phone or tablet.</p>
    </section>
  );
}
