import { Vector2d } from "konva/lib/types";
import { useMemo } from "react";
import { Layer, Line } from "react-konva";
import { Dimension } from "../type";

interface Props {
  startingPoint: Vector2d;
  imageDimension: Dimension;
  scale: Vector2d;
}

const Grid = ({ startingPoint, imageDimension, scale }: Props) => {
  const verticals = useMemo(() => {
    const numberOfLines = 6;
    const distance = imageDimension.width / (numberOfLines - 1);
    console.log("VERTICALS ", { numberOfLines, distance });
    return Array.from({ length: numberOfLines }, (_, idx) => ({
      key: idx,
      x: startingPoint.x + idx * distance,
      y: startingPoint.y,
      points: [0, 0, 0, imageDimension.height],
    }));
  }, [startingPoint, imageDimension, scale]);

  const horizontals = useMemo(() => {
    const numberOfLines =
      Math.ceil((6 * imageDimension.height) / imageDimension.width) + 1;
    const distance = imageDimension.height / (numberOfLines - 1);
    console.log("HORIZONTALS ", { numberOfLines, distance });
    return Array.from({ length: numberOfLines }, (_, idx) => ({
      key: idx,
      x: startingPoint.x,
      y:
        startingPoint.y +
        (idx + 1 === numberOfLines ? imageDimension.height : idx * distance),
      points: [0, 0, imageDimension.width, 0],
    }));
  }, [startingPoint, imageDimension, scale]);

  console.log({ verticals, horizontals });

  return (
    <Layer>
      {verticals.map((l) => (
        <Line stroke="#c753c9" {...l} />
      ))}
      {horizontals.map((l) => (
        <Line stroke="#c753c9" {...l} />
      ))}
    </Layer>
  );
};

export default Grid;
