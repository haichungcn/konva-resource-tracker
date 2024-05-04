import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useMemo, useRef } from "react";
import { Circle, Layer, Group, Text, Rect } from "react-konva";
import { ZOOM_STEP } from "../constants";
import Pin from "./pin";
import { GroupItem, PinItem, StageChildrenProps } from "../type";
import { groupPins } from "../utils";
import { isEqual, pick } from "lodash";

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
  const lastChangeCount = useRef<number>(0);
  const changeCount = useRef<number>(0);
  const pinArraysRef = useRef<typeof pinArrays>([]);
  const groupByScales = useRef<{ [key: number]: GroupItem[] }>({});

  const pinArraysUpdatedCount = useMemo(() => {
    const isSame = isEqual(pinArrays, pinArraysRef.current);
    if (!isSame) {
      pinArraysRef.current = pinArrays;
      changeCount.current += 1;
    }
    return changeCount.current;
  }, [pinArrays]);

  const pinGroups = useMemo(() => {
    if (
      !pinArrays.length ||
      !groupLayer.current ||
      !startingPosition.x ||
      floorplanStatus !== "loaded"
    )
      return [];

    if (lastChangeCount.current !== changeCount.current) {
      // invalidate cache
      groupByScales.current = {};
      lastChangeCount.current = changeCount.current;
    }

    // use cached data
    if (groupByScales.current[scale.x]) return groupByScales.current[scale.x];

    // sort all pins based on x axis;
    const xSortedPins = pinArrays
      .map((pin) => ({
        ...pin,
        x: pin.x + startingPosition.x,
        y: pin.y + startingPosition.y,
      }))
      .sort((a, b) => a.x - b.x);

    const groups = groupPins(xSortedPins, scale).sort(
      (a, b) => a.size - b.size,
    );

    // cache data
    groupByScales.current[scale.x] = groups;

    return groups;
  }, [
    pinArraysUpdatedCount,
    startingPosition.x,
    startingPosition.y,
    floorplanStatus,
    scale.x,
    scale.y,
  ]);

  return (
    <>
      <Layer name="group-layer" ref={groupLayer}>
        {floorplanStatus === "loaded" &&
          pinGroups.map((group, index) =>
            group.size > 1 ? (
              <Group
                key={index}
                style={{ cursor: "text" }}
                onMouseEnter={(e: KonvaEventObject<MouseEvent>) => {
                  e.evt.stopPropagation();
                  const stage = e.target.getStage();
                  if (stage) stage.container().style.cursor = "pointer";
                  const group = e.target.getParent();
                  if (group) group.zIndex(pinGroups.length);
                }}
                onMouseLeave={(e: KonvaEventObject<MouseEvent>) => {
                  e.evt.stopPropagation();
                  const stage = e.target.getStage();
                  const group = e.target.getParent();
                  if (!!group) group.zIndex(group.index);
                  if (stage) stage.container().style.cursor = "grab";
                }}
                onClick={(e) => {
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
                <Group>
                  <Rect
                    name="group-size"
                    x={group.x + 4 / scale.x}
                    y={group.y - 67 / scale.x}
                    width={group.size < 10 ? 19 : 28}
                    height={28}
                    cornerRadius={10}
                    fill="#3D55DF"
                    scale={{ x: 1 / scale.x, y: 1 / scale.y }}
                  />
                  <Text
                    x={group.x + 9 / scale.x}
                    y={group.y - 60 / scale.x}
                    text={group.size.toString()}
                    scale={{ x: 1 / scale.x, y: 1 / scale.y }}
                    fill="white"
                    fontSize={16}
                    fontWeight={700}
                  />
                </Group>
                <Circle
                  name="group-anchor"
                  x={group.x}
                  y={group.y}
                  width={8}
                  height={8}
                  fill="purple"
                  scale={{ x: 1 / scale.x, y: 1 / scale.y }}
                />
              </Group>
            ) : (
              <Pin
                key={index}
                x={group.children[0].x}
                y={group.children[0].y}
                startingPosition={startingPosition}
                stageScale={scale}
                name={`pin#${index}`}
                url={pinURL}
                strokeEnabled
                onMouseOver={(e) => {
                  e.target.zIndex(pinGroups.length);
                }}
                onClick={() => {
                  onZoomIn(
                    {
                      x: 3,
                      y: 3,
                    },
                    pick(group.children[0], ["x", "y"]),
                  );
                }}
              />
            ),
          )}
      </Layer>
    </>
  );
};

export default PinLayers;
