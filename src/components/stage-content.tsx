import { useMemo, useRef, useState } from "react";
import { Layer, Circle } from "react-konva";
import { MOCK_FLOOR_URL, STAGE_WIDTH, STAGE_HEIGHT } from "../constants";
import { Dimension, ImageStatus, StageChildrenProps } from "../type";
import FloorPlanImage from "./floor-plan-image";
import Pin from "./pin";

const getPinArrays = (floorplanDimension: Dimension | null) =>
  !!floorplanDimension
    ? Array.from({ length: 20 }, () => ({
        x: Math.random() * floorplanDimension.width,
        y: Math.random() * floorplanDimension.height,
      }))
    : [];

const StageContent = ({
  startingPosition,
  setStartingPosition,
  scale,
  stage,
}: StageChildrenProps) => {
  const floorplanDimension = useRef<Dimension | null>(null);
  const [floorplanStatus, setFloorplanStatus] = useState<ImageStatus>();
  const pinArrays = useMemo(
    () => getPinArrays(floorplanDimension.current),
    [floorplanStatus],
  );
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
          pinArrays.map(({ x, y }, index) => (
            <>
              <Pin
                x={startingPosition.x + x}
                y={startingPosition.y + y}
                startingPosition={startingPosition}
                stageScale={scale}
                name={`pin#${index}`}
              />
              <Circle
                x={startingPosition.x + x}
                y={startingPosition.y + y}
                width={8}
                height={8}
                fill={index === 15 ? "green" : "red"}
                scale={{ x: 1 / scale.x, y: 1 / scale.y }}
              />
            </>
          ))}
      </Layer>
    </>
  );
};

export default StageContent;
