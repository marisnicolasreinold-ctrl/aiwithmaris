import React from "react";
import { Composition } from "remotion";
import { Intro } from "./Intro";

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
    </>
  );
};
