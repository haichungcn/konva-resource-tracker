import { StageChildrenProps } from "../type";
import ComposibleStage from "./stage";
import StageContent from "./stage-content";

interface Props {
  selectedPin: number;
  floorplanURL: string;
  pinURL: string;
}

const ResourceTracker = ({ floorplanURL, pinURL, selectedPin }: Props) => {
  return (
    <ComposibleStage selectedPin={selectedPin}>
      {(props: StageChildrenProps) => {
        return (
          <StageContent
            {...props}
            floorplanURL={floorplanURL}
            pinURL={pinURL}
          />
        );
      }}
    </ComposibleStage>
  );
};

export default ResourceTracker;
