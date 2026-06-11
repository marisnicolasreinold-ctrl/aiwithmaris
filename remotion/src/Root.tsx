import React from "react";
import { Composition } from "remotion";
import { Intro } from "./Intro";
import { GuidePromo } from "./GuidePromo";
import { LibraryPromo } from "./LibraryPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="IntroDe"
        component={Intro}
        durationInFrames={470}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ lang: "de" as const }}
      />
      <Composition
        id="IntroEn"
        component={Intro}
        durationInFrames={470}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ lang: "en" as const }}
      />
      <Composition
        id="GuidePromoDe"
        component={GuidePromo}
        durationInFrames={440}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ lang: "de" as const }}
      />
      <Composition
        id="GuidePromoEn"
        component={GuidePromo}
        durationInFrames={440}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ lang: "en" as const }}
      />
      <Composition
        id="LibraryPromoDe"
        component={LibraryPromo}
        durationInFrames={500}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ lang: "de" as const }}
      />
      <Composition
        id="LibraryPromoEn"
        component={LibraryPromo}
        durationInFrames={500}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{ lang: "en" as const }}
      />
    </>
  );
};
