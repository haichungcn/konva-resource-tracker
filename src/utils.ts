import Konva from "konva";

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
