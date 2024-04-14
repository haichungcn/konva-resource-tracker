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
