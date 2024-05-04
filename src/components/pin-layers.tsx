import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useRef, useState } from "react";
import { Circle, Layer, Group, Text } from "react-konva";
import { SCALE_LIMIT, ZOOM_STEP } from "../constants";
import Pin from "./pin";
import { GroupItem, PinItem, StageChildrenProps } from "../type";
import { groupPins } from "../utils";
import { pick } from "lodash";

interface Props
  extends Pick<StageChildrenProps, "scale" | "startingPosition" | "onZoomIn"> {
  pinArrays: PinItem[];
  pinURL: string;
  groupPinURL: string;
  floorplanStatus?: "loaded" | "loading" | "failed";
}

const PinLayers = ({
  scale,
  pinURL,
  groupPinURL,
  startingPosition,
  floorplanStatus,
  pinArrays,
  onZoomIn,
}: Props) => {
  const groupLayer = useRef<Konva.Layer>(null);

  const [pinGroups, setPinGroups] = useState<GroupItem[]>([]);

  const handleOnMouseOverPinGroup = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = "default";
    const group = e.target.getParent();
    if (group) group.zIndex(pinGroups.length + 100);
  };

  const handleOnMouseLeavePinGroup = (e: KonvaEventObject<MouseEvent>) => {
    e.evt.stopPropagation();
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = "grab";
  };

  useEffect(() => {
    if (
      !pinArrays.length ||
      !groupLayer.current ||
      !startingPosition.x ||
      floorplanStatus !== "loaded"
    )
      return;

    // sort all pins based on x axis;
    const xSortedPins = pinArrays
      .map((pin) => ({
        ...pin,
        x: pin.x + startingPosition.x,
        y: pin.y + startingPosition.y,
      }))
      .sort((a, b) => a.x - b.x);

    const groups = groupPins(xSortedPins, scale);

    setPinGroups(groups.sort((a, b) => a.size - b.size));
  }, [pinArrays, startingPosition, floorplanStatus, scale.x]);

  return (
    <>
      <Layer name="group-layer" ref={groupLayer}>
        {floorplanStatus === "loaded" &&
          pinGroups.map((group, index) =>
            group.size > 1 ? (
              <Group
                key={index}
                style={{ cursor: "text" }}
                onMouseOver={handleOnMouseOverPinGroup}
                onMouseLeave={handleOnMouseLeavePinGroup}
                onClick={(e) => {
                  e.evt.stopPropagation();
                  onZoomIn(
                    {
                      x: group.unGroupScale + ZOOM_STEP,
                      y: group.unGroupScale + ZOOM_STEP,
                    },
                    pick(group, ["x", "y"]),
                  );
                }}
              >
                <Pin
                  x={group.x}
                  y={group.y}
                  startingPosition={startingPosition}
                  stageScale={scale}
                  name={`group-pin#${index}`}
                  url={groupPinURL}
                  strokeEnabled
                />
                <Circle
                  name="group-anchor"
                  x={group.x}
                  y={group.y}
                  width={8}
                  height={8}
                  fill="purple"
                  scale={{ x: 1 / scale.x, y: 1 / scale.y }}
                />
                <Circle
                  name="group-size"
                  x={group.x + 15 / scale.x}
                  y={group.y - 52 / scale.x}
                  width={28}
                  height={28}
                  cornerRadius={10}
                  fill="#3D55DF"
                  scale={{ x: 1 / scale.x, y: 1 / scale.y }}
                />
                <Text
                  x={group.x + 11 / scale.x}
                  y={group.y - 59 / scale.x}
                  text={group.size.toString()}
                  scale={{ x: 1 / scale.x, y: 1 / scale.y }}
                  fill="white"
                  fontSize={16}
                  fontWeight={700}
                />
              </Group>
            ) : (
              <Pin
                x={group.children[0].x}
                y={group.children[0].y}
                startingPosition={startingPosition}
                stageScale={scale}
                name={`pin#${index}`}
                url={pinURL}
                strokeEnabled
                onMouseOver={(e) => {
                  e.target.zIndex(pinGroups.length + 100);
                }}
              />
            ),
          )}
      </Layer>
    </>
  );
};

export default PinLayers;
