import { StageChildrenProps } from "../type";
import ComposibleStage from "./stage";
import StageContent from "./stage-content";

interface Props {
  selectedPin: number;
  activePin: number | null;
  floorplanURL: string;
  pinURL: string;
  enableTooltip: boolean;
  enableGrid: boolean;
}

const ResourceTracker = ({
  floorplanURL,
  pinURL,
  selectedPin,
  activePin,
  enableTooltip,
  enableGrid,
}: Props) => {
  return (
    <ComposibleStage activePin={activePin} enableTooltip={enableTooltip}>
      {(props: StageChildrenProps) => {
        return (
          <StageContent
            {...props}
            floorplanURL={floorplanURL}
            pinURL={pinURL}
            selectedPin={selectedPin}
            enableGrid={enableGrid}
          />
        );
      }}
    </ComposibleStage>
  );
};

export default ResourceTracker;
