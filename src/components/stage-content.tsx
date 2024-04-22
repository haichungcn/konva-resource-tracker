import { useMemo, useRef, useState } from "react";
import { Layer, Circle } from "react-konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants";
import { Dimension, ImageStatus, StageChildrenProps } from "../type";
import FloorPlanImage from "./floor-plan-image";
import Grid from "./grid";
import Pin from "./pin";

const getPinArrays = (floorplanDimension: Dimension | null) =>
  !!floorplanDimension
    ? Array.from({ length: Math.floor(Math.random() * 100 + 20) }, () => ({
        x: Math.random() * floorplanDimension.width,
        y: Math.random() * floorplanDimension.height,
      }))
    : [];

interface Props {
  pinURL: string;
  floorplanURL?: string;
  selectedPin: number;
  enableGrid: boolean;
}

const StageContent = ({
  startingPosition,
  setStartingPosition,
  scale,
  pinURL,
  floorplanURL,
  selectedPin,
  enableGrid,
}: StageChildrenProps & Props) => {
  const floorplanDimension = useRef<Dimension | null>(null);
  const [floorplanStatus, setFloorplanStatus] = useState<ImageStatus>();
  const pinArrays = useMemo(
    () => getPinArrays(floorplanDimension.current),
    [floorplanStatus],
  );
  return (
    <>
      <Layer>
        {!!floorplanURL && (
          <FloorPlanImage
            url={floorplanURL}
            stageDimension={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
            onImageLoad={(initialState) => {
              setStartingPosition(initialState.startingPosition);
              floorplanDimension.current = initialState.startingDimension;
              setFloorplanStatus(initialState.status);
            }}
          />
        )}
      </Layer>
      <Layer>
        {floorplanStatus === "loaded" &&
          !!pinURL &&
          pinArrays.map(({ x, y }, index) => (
            <>
              <Pin
                x={startingPosition.x + x}
                y={startingPosition.y + y}
                startingPosition={startingPosition}
                stageScale={scale}
                name={`pin#${index}`}
                url={pinURL}
              />
              <Circle
                x={startingPosition.x + x}
                y={startingPosition.y + y}
                width={8}
                height={8}
                fill={index === selectedPin ? "green" : "red"}
                scale={{ x: 1 / scale.x, y: 1 / scale.y }}
              />
            </>
          ))}
      </Layer>
      {enableGrid &&
        floorplanStatus === "loaded" &&
        floorplanDimension.current && (
          <Grid
            startingPoint={startingPosition}
            imageDimension={floorplanDimension.current}
            scale={scale}
          />
        )}
    </>
  );
};

export default StageContent;
