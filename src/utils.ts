import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { mean } from "lodash";
import { SCALE_LIMIT, ZOOM_STEP } from "./constants";
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
  const { x: bX, y: bY } = b; // assuming a & b have the same width and height
  return (
    Math.abs(aX - bX) * scale.x < aW / 1.75 &&
    Math.abs(aY - bY) * scale.y < aH / 2
  );
};

export const nearestDivisible = (num: number, divisor: number) => {
  return Math.round(num / divisor) * divisor;
};

export const calculateNonCollapsedScale = (a: PinItem, b: PinItem) => {
  const { x: aX, y: aY, width: aW, height: aH } = a;
  const { x: bX, y: bY } = b;
  const nonCollapsedDistance = Math.max(aW, aH);
  let result = SCALE_LIMIT.MAX;
  result = nonCollapsedDistance / Math.hypot(bX - aX, bY - aY);
  result = Math.min(
    SCALE_LIMIT.MAX,
    Number(nearestDivisible(result, ZOOM_STEP).toFixed(1)),
  );
  return result;
};

export const groupPins = (pins: PinItem[], scale: Vector2d): GroupItem[] => {
  const groups: GroupItem[] = [];
  const remaining: PinItem[] = [...pins];

  while (remaining.length > 0) {
    let unGroupScale = SCALE_LIMIT.MIN; // optimal zoom scale to show all children
    const current = remaining.shift();

    if (!current) break;

    const group: PinItem[] = [current];

    for (let i = remaining.length - 1; i >= 0; i--) {
      if (
        scale.x !== SCALE_LIMIT.MAX && // on maximum zoom, show all pins
        isCollapsed(current, remaining[i], scale)
      ) {
        group.push(remaining[i]);
        const newUnGroupScale = calculateNonCollapsedScale(
          current,
          remaining[i],
        );
        if (newUnGroupScale > unGroupScale) unGroupScale = newUnGroupScale;
        remaining.splice(i, 1);
      }
    }

    // Calculate average coordinates of the group
    const avgX = mean(group.map((i) => i.x));
    const avgY = mean(group.map((i) => i.y));

    // Push the average coordinates and group size to the groups array
    groups.push({
      x: avgX,
      y: avgY,
      size: group.length,
      children: group,
      unGroupScale,
    });
  }

  return groups;
};

export const roundNumber = (num: number) => Number(num.toFixed(1));
