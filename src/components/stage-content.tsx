import Konva from "konva";
import { mean } from "lodash";
import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, Circle, Text } from "react-konva";
import { STAGE_WIDTH, STAGE_HEIGHT } from "../constants";
import { Dimension, ImageStatus, StageChildrenProps } from "../type";
import FloorPlanImage from "./floor-plan-image";
import Grid from "./grid";
import Pin from "./pin";

// const getPinArrays = (floorplanDimension: Dimension | null) =>
//   !!floorplanDimension
//     ? Array.from({ length: Math.floor(Math.random() * 30 + 20) }, () => ({
//         x: Math.random() * floorplanDimension.width,
//         y: Math.random() * floorplanDimension.height,
//       }))
//     : []

const getPinArrays = (dimension: unknown) => {
  return [
    {
      x: 145,
      y: 200,
    },
    // {
    //   x: 148,
    //   y: 350,
    // },
    {
      x: 149,
      y: 210,
    },
    {
      x: 248,
      y: 550,
    },
    {
      x: 350,
      y: 400,
    },
    {
      x: 340,
      y: 410,
    },
  ];
};

const isGroup = (item: Group | unknown): item is Group =>
  "type" in (item as any) && (item as any).type === "group";
const isCollapsed = (a: Konva.Node, b: Konva.Node) => {
  const { x: aX, y: aY } = a.getAbsolutePosition();
  const { x: bX, y: bY } = b.getAbsolutePosition();
  return (
    Math.abs(aX - bX) < a.width() / 3 && Math.abs(aY - bY) < a.height() / 3
  );
};

interface Group {
  type: "group";
  x: number;
  y: number;
  children: Konva.Node[];
}

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
  const pinLayer = useRef<Konva.Layer>(null);
  const groupLayer = useRef<Konva.Layer>(null);

  const floorplanDimension = useRef<Dimension | null>(null);
  const [floorplanStatus, setFloorplanStatus] = useState<ImageStatus>();
  const [pinGroups, setPinGroups] = useState<(Group | Konva.Node)[]>([]);

  const pinArrays = useMemo(
    () => getPinArrays(floorplanDimension.current),
    [floorplanStatus],
  );

  useEffect(() => {
    if (!pinLayer.current || floorplanStatus !== "loaded") return;
    const layer = pinLayer.current;
    const pins = layer.getChildren((i) => i.name().includes("pin"));
    console.log("Absolute", {
      pins,
      absPins: pins.map((i) => i.getAbsolutePosition()),
    });
    // sort all pins based on x axis;
    const xSortedPins = pins.sort((a, b) => a.x() - b.x());

    let referencePinIdx: number | null = null;
    const groups: (Group | Konva.Node)[] = [];
    let hasGroup = false;

    const addToGroup = (pin: Konva.Node, targetPin: Konva.Node) => {
      const currentGroup = groups[pin.getAttr("group")];
      if (typeof pin.getAttr("group") === "undefined" || !currentGroup) {
        const items = [pin, targetPin];
        groups.push({
          type: "group",
          children: items,
          x: mean(items.map((i) => i.x())),
          y: mean(items.map((i) => i.y())),
        });
        pin.setAttr("group", groups.length - 0);
        hasGroup = true;
      } else {
        if (!!isGroup(currentGroup)) {
          currentGroup.children.push(targetPin);
          currentGroup.x = mean(currentGroup.children.map((i) => i.x()));
          currentGroup.y = mean(currentGroup.children.map((i) => i.y()));
        }
      }
      targetPin.setAttr("group", groups.length - 0);
    };

    for (const [index, p] of xSortedPins.entries()) {
      const nextPin = xSortedPins[index + 1];
      if (!nextPin) break;

      if (!isCollapsed(p, nextPin)) {
        console.log("1", { p });
        if (p.getAttr("group")) continue;
        if (typeof referencePinIdx === "number") {
          for (let i = referencePinIdx; i < index - 1; i++) {
            if (isCollapsed(p, xSortedPins[i])) {
              addToGroup(xSortedPins[i], p);
              break;
            }
          }
        }
        console.log({ p });
        if (!p.getAttr("group")) {
          groups.push(p);
        }

        if (nextPin.x() - p.x() > p.width() / 2) {
          referencePinIdx = index + 1;
        } else {
          typeof referencePinIdx === "number"
            ? referencePinIdx++
            : (referencePinIdx = index);
        }

        continue;
      }

      addToGroup(p, nextPin);
    }

    console.log({ pins, xSortedPins, groups });

    // if (hasGroup) {
    //   layer.hide();
    //   groupLayer.current?.show();
    // } else {
    //   layer.show();
    //   groupLayer.current?.hide();
    // }
    setPinGroups(groups);
  }, [floorplanStatus, scale]);

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
      <Layer name="pin-layer" ref={pinLayer} opacity={0.4}>
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
          pinGroups.map((item, index) =>
            isGroup(item) ? (
              <React.Fragment key={index}>
                <Text
                  x={item.x}
                  y={item.y}
                  name={`group#{index}`}
                  text={`GROUP-${index} (${item.children.length})`}
                  fontWeight={700}
                  fill={"purple"}
                />
                <Circle
                  x={item.x}
                  y={item.y}
                  width={8}
                  height={8}
                  fill="purple"
                />
              </React.Fragment>
            ) : (
              <Pin
                key={index}
                x={item.x()}
                y={item.y()}
                startingPosition={startingPosition}
                stageScale={scale}
                name={`pin#${index}`}
                url={pinURL}
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
