import { featureStatusMeta, getFeature, site } from "@/config/site";
import { memeRadar } from "@/content/home";
import { RadarStory } from "./radar-story";

/** Flagship chapter. Its labels follow the Meme Radar status in the site config. */
export function MemeRadar() {
  const radar = getFeature("meme-radar");
  const statusLabel = featureStatusMeta[radar.status].label;
  const isLive = radar.status === "available_beta" || radar.status === "limited_beta";

  return (
    <RadarStory
      eyebrow={isLive ? `${radar.title} — ${statusLabel}` : `${radar.title} — Preview / ${statusLabel}`}
      status={radar.status}
      statusLabel={statusLabel}
      demoLabel={site.demo.label}
      title={memeRadar.title}
      lede={memeRadar.lede}
      acts={memeRadar.acts}
      handle={site.demo.sampleHandle}
      post={site.demo.samplePost}
      tokens={memeRadar.tokens}
      resultGroups={memeRadar.resultGroups}
      report={memeRadar.report}
      confirmNote={memeRadar.confirmNote}
      previewTag={memeRadar.previewTag}
      feedLabel={memeRadar.feedLabel}
      feed={memeRadar.feed}
      disclaimer={memeRadar.disclaimer}
      cta={site.cta.memeRadar}
    />
  );
}
