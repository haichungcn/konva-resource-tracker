import { Vector2d } from "konva/lib/types";
import { Circle, Image } from "react-konva";
import useImage from "use-image";

interface Props {
  x: number;
  y: number;
  startingPosition: Vector2d;
  stageScale: Vector2d;
  name: string;
  url: string;
  strokeEnabled?: boolean;
}

const Pin = ({ x, y, stageScale, url, name, strokeEnabled }: Props) => {
  const [image, status] = useImage(url);

  return !!image && status === "loaded" ? (
    <>
      <Image
        name={name}
        x={x}
        y={y}
        offsetX={40 / 2}
        offsetY={40}
        image={image}
        width={40}
        height={40}
        scale={{ x: 1 / stageScale.x, y: 1 / stageScale.y }}
        strokeEnabled={strokeEnabled}
      />

      <Circle
        x={x}
        y={y}
        width={8}
        height={8}
        fill="red"
        scale={{ x: 1 / stageScale.x, y: 1 / stageScale.y }}
      />
    </>
  ) : null;
};

export default Pin;
