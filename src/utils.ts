import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { mean } from "lodash";
import { GroupItem, PinItem } from "./type";

export const calculateOptimalScaleRatio = (
  containerWidth: number,
  containerHeight: number,
  itemWidth: number,
  itemHeight: number,
) => {
  const containerRatio = containerHeight / containerWidth;
  const itemRatio = itemHeight / itemWidth;

  return containerRatio > itemRatio
    ? containerWidth / itemWidth
    : containerHeight / itemHeight;
};

export const generateSmallestDimension = (
  containerWidth: number,
  containerHeight: number,
  itemWidth: number,
  itemHeight: number,
  totalPadding: number = 0,
) => {
  const ratio = calculateOptimalScaleRatio(
    containerWidth,
    containerHeight,
    itemWidth,
    itemHeight,
  );
  const initialWidth = itemWidth * ratio - totalPadding;
  const initialHeight = itemHeight * ratio - totalPadding;
  return {
    width: initialWidth,
    height: initialHeight,
  };
};

export const findNodes = (
  stage: Konva.Stage | null,
  determineNode: (node: Konva.Node) => boolean,
) => {
  if (!stage) return [];

  let result: Konva.Node[] = [];
  const stageChildren = stage.children;

  for (const node of stageChildren) {
    if (node.getClassName() === "Layer") {
      const childNodes = node.getChildren(determineNode);
      if (childNodes?.length) {
        childNodes.forEach((n) => result.push(n));
        break;
      }
      continue;
    }

    if (determineNode(node)) {
      result.push(node);
      break;
    }
  }

  return result;
};

export const findFloorplanImageNode = (node: Konva.Node) =>
  node.getClassName() === "Image" && node.getAttr("name") === "floor-plan__img";

export const findPin = (pinName: string) => (node: Konva.Node) =>
  node.getClassName() === "Image" && node.getAttr("name") === pinName;

export const isCollapsed = (a: PinItem, b: PinItem, scale: Vector2d) => {
  const { x: aX, y: aY, width: aW, height: aH } = a;
  const { x: bX, y: bY } = b;
  const distance = Math.hypot((bX - aX) * scale.x, (bY - aY) * scale.y);
  return distance < Math.max(aW / 3, aH / 3);
};

export const groupPins = (pins: PinItem[], scale: Vector2d): GroupItem[] => {
  const groups: GroupItem[] = [];
  const remaining: PinItem[] = [...pins];

  while (remaining.length > 0) {
    const current = remaining.shift();
    if (!current) break;
    const group: PinItem[] = [current];
    for (let i = remaining.length - 1; i >= 0; i--) {
      if (isCollapsed(current, remaining[i], scale)) {
        group.push(remaining[i]);
        remaining.splice(i, 1);
      }
    }

    // Calculate average coordinates of the group
    const avgX = mean(group.map((i) => i.x));
    const avgY = mean(group.map((i) => i.y));

    // Push the average coordinates and group size to the groupedMarkers array
    groups.push({
      x: avgX,
      y: avgY,
      size: group.length,
      children: group,
      unGroupScale: scale.x, //  TODO: calculate this
    });
  }

  return groups;
};
