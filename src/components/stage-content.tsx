import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import { mean } from "lodash";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, Circle, Text, Label, Rect, Group } from "react-konva";
import {
  STAGE_WIDTH,
  STAGE_HEIGHT,
  ZOOM_STEP,
  SCALE_LIMIT,
} from "../constants";
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

const isCollapsed = (a: Konva.Node, b: Konva.Node) => {
  const { x: aX, y: aY } = a.getAbsolutePosition();
  const { x: bX, y: bY } = b.getAbsolutePosition();
  const distance = Math.hypot(bX - aX, bY - aY);
  return distance < Math.max(a.width() / 2, a.height() / 2);
};

const groupPins = (pins: Konva.Node[], scale: Vector2d): [Group[], boolean] => {
  let hasGroup = false;

  const groups: Group[] = [];
  const remaining: Konva.Node[] = [...pins];

  while (remaining.length > 0) {
    const current = remaining.shift();
    if (!current) break;
    const group: Konva.Node[] = [current];
    for (let i = remaining.length - 1; i >= 0; i--) {
      if (isCollapsed(current, remaining[i])) {
        hasGroup = true;
        group.push(remaining[i]);
        remaining.splice(i, 1);
      }
    }

    // Calculate average coordinates of the group
    const avgX = mean(group.map((i) => i.x()));
    const avgY = mean(group.map((i) => i.y()));

    // Push the average coordinates and group size to the groupedMarkers array
    groups.push({
      x: avgX,
      y: avgY,
      size: group.length,
      children: group,
      groupScale: scale.x,
    });
  }

  return [groups, hasGroup];
};

interface Group {
  x: number;
  y: number;
  children: Konva.Node[];
  size: number;
  groupScale: number; // at which scale should the group formed
}

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
  const pinLayer = useRef<Konva.Layer>(null);
  const groupLayer = useRef<Konva.Layer>(null);

  const floorplanDimension = useRef<Dimension | null>(null);
  const [floorplanStatus, setFloorplanStatus] = useState<ImageStatus>();
  const [pinGroups, setPinGroups] = useState<Group[]>([]);

  const pinArrays = useMemo(
    () => getPinArrays(floorplanDimension.current),
    [floorplanStatus],
  );

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

  // const handleOnClickPinGroup = (e: KonvaEventObject<MouseEvent>) => {
  //   onZoomIn({
  //     x: SCALE_LIMIT.MAX,
  //     y: SCALE_LIMIT.MAX,
  //   });
  // };

  useEffect(() => {
    if (!pinLayer.current || floorplanStatus !== "loaded") return;
    const layer = pinLayer.current;
    const pins = layer.getChildren((i) => i.name().includes("pin"));

    // sort all pins based on x axis;
    const xSortedPins = pins.sort((a, b) => a.x() - b.x());

    if (scale.x === SCALE_LIMIT.MAX) {
      setPinGroups([]);
      layer.show();
      groupLayer.current?.hide();
      return;
    }
    const [groups, hasGroup] = groupPins(xSortedPins, scale);

    if (hasGroup) {
      layer.hide();
      groupLayer.current?.show();
    } else {
      layer.show();
      groupLayer.current?.hide();
    }
    setPinGroups(groups);
  }, [pinArrays, floorplanStatus, scale]);

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
      <Layer name="pin-layer" ref={pinLayer}>
        {floorplanStatus === "loaded" &&
          !!pinURL &&
          pinArrays.map(({ x, y }, index) => (
            <Pin
              key={index}
              x={startingPosition.x + x}
              y={startingPosition.y + y}
              startingPosition={startingPosition}
              stageScale={scale}
              name={`pin#${index}`}
              url={pinURL}
            />
          ))}
      </Layer>
      <Layer name="group-layer" ref={groupLayer}>
        {floorplanStatus === "loaded" &&
          pinGroups
            .sort((a, b) => a.size - b.size)
            .map((group, index) =>
              group.size > 1 ? (
                <Group
                  key={index}
                  style={{ cursor: "text" }}
                  onMouseOver={handleOnMouseOverPinGroup}
                  onMouseLeave={handleOnMouseLeavePinGroup}
                  // onClick={handleOnClickPinGroup}
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
                  x={group.children[0].x()}
                  y={group.children[0].y()}
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
