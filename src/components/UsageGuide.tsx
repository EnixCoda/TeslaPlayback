import { Heading } from "@primer/react";

export function UsageGuide() {
  return (
    <section>
      <Heading as="h2" sx={{ fontSize: 3 }}>
        How to use
      </Heading>
      <ol>
        <li>Please access with Safari or Firefox, videos may not play on Chrome and Edge.</li>
        <li>Unplug the USB drive from your Tesla and insert it to computer</li>
        <li>Click the "Load files" button above</li>
        <li>
          Select the drive or its root directory, whose name should be <em>TeslaCam</em>, <em>RecentClips</em>, <em>SavedClips</em>, or <em>SentryClips</em>.
          <p>
            Note: Your browser may warn you that files are going to be uploaded. In fact, no files would be uploaded at all. You can disconnect
            network before selecting files and continue use offline to ensure of that.
          </p>
        </li>
        <li>Videos should start playing if you chose the proper directory. If not, please retry using Safari or Firefox.</li>
      </ol>
    </section>
  );
}
