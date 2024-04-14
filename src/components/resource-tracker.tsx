import { Circle, Layer } from "react-konva";
import FloorPlanImage from "./floor-plan-image";
import { STAGE_WIDTH, STAGE_HEIGHT, MOCK_FLOOR_URL } from "../constants";
import { Dimension, ImageStatus, StageChildrenProps } from "../type";
import ComposibleStage from "./stage";
import Pin from "./pin";
import { useMemo, useRef, useState } from "react";

const getPinArrays = (floorplanDimension: Dimension | null) =>
  !!floorplanDimension
    ? Array.from({ length: 20 }, () => ({
        x: Math.random() * floorplanDimension.width,
        y: Math.random() * floorplanDimension.height,
      }))
    : [];

const ResourceTracker = ({}) => {
  const floorplanDimension = useRef<Dimension | null>(null);
  const [floorplanStatus, setFloorplanStatus] = useState<ImageStatus>();
  const pinArrays = useMemo(
    () => getPinArrays(floorplanDimension.current),
    [floorplanStatus],
  );
  return (
    <ComposibleStage>
      {({
        startingPosition,
        setStartingPosition,
        scale,
      }: StageChildrenProps) => {
        return (
          <>
            <Layer>
              <FloorPlanImage
                url={MOCK_FLOOR_URL}
                stageDimension={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
                onImageLoad={(initialState) => {
                  setStartingPosition(initialState.startingPosition);
                  floorplanDimension.current = initialState.startingDimension;
                  setFloorplanStatus(initialState.status);
                }}
              />
            </Layer>
            <Layer>
              {floorplanStatus === "loaded" &&
                pinArrays.map(({ x, y }) => (
                  <>
                    <Pin
                      x={startingPosition.x + x}
                      y={startingPosition.y + y}
                      startingPosition={startingPosition}
                      stageScale={scale}
                    />
                    <Circle
                      x={startingPosition.x + x}
                      y={startingPosition.y + y}
                      width={8}
                      height={8}
                      fill="red"
                      scale={{ x: 1 / scale.x, y: 1 / scale.y }}
                    />
                  </>
                ))}
            </Layer>
          </>
        );
      }}
    </ComposibleStage>
  );
};

export default ResourceTracker;
