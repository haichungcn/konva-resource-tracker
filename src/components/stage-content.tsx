import { useMemo, useRef, useState } from "react";
import { Layer } from "react-konva";
import { STAGE_WIDTH, STAGE_HEIGHT, PIN_HEIGHT, PIN_WIDTH } from "../constants";
import { Dimension, ImageStatus, StageChildrenProps } from "../type";
import FloorPlanImage from "./floor-plan-image";
import Grid from "./grid";
import PinLayers from "./pin-layers";

const getPinArrays = (floorplanDimension: Dimension | null) =>
  !!floorplanDimension
    ? Array.from({ length: Math.floor(Math.random() * 100 + 20) }, () => ({
        x: Math.random() * floorplanDimension.width,
        y: Math.random() * floorplanDimension.height,
        height: PIN_HEIGHT,
        width: PIN_WIDTH,
      }))
    : [];

interface Props {
  pinURL: string;
  groupPinURL: string;
  floorplanURL?: string;
  selectedPin: number;
  enableGrid: boolean;
}

const StageContent = ({
  startingPosition,
  setStartingPosition,
  scale,
  onZoomIn,
  pinURL,
  groupPinURL,
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
      <PinLayers
        pinURL={pinURL}
        groupPinURL={groupPinURL}
        scale={scale}
        startingPosition={startingPosition}
        floorplanStatus={floorplanStatus}
        pinArrays={pinArrays}
        onZoomIn={onZoomIn}
      />
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
