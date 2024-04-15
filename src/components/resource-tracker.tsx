import { StageChildrenProps } from "../type";
import ComposibleStage from "./stage";
import StageContent from "./stage-content";

const ResourceTracker = ({}) => {
  return (
    <ComposibleStage>
      {(props: StageChildrenProps) => {
        return <StageContent {...props} />;
      }}
    </ComposibleStage>
  );
};

export default ResourceTracker;
