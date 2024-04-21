import { Heading } from "@primer/react";

export function UsageGuide() {
  return (
    <section>
      <Heading as="h2" sx={{ fontSize: 3 }}>
        How to use
      </Heading>
      <ol>
        <li>Disconnect the USB drive from your Tesla and connect it to your computer.</li>
        <li>Initiate the process by clicking the "Load DashCam Files" button.</li>
        <li>
          Navigate to and select the USB drive or its root folder <em>TeslaCam</em>, which contains <em>RecentClips</em>, <em>SavedClips</em>, or{" "}
          <em>SentryClips</em>.
        </li>
        <li>Upon selecting the correct folder, your Tesla's video files will automatically begin playback.</li>
      </ol>
      <section>
        <Heading as="h3" sx={{ fontSize: 2 }}>
          Note
        </Heading>
        <ul>
          <li>
            No files will be uploaded. If your browser prompts a warning about file uploads, please ignore it. For added security, feel free to
            disconnect from internet before you proceed.
          </li>
          <li>This web app is for 🖥️ 💻 computer usages (Windows/macOS/Linux). It might not work on phone or tablet.</li>
        </ul>
      </section>
    </section>
  );
}
