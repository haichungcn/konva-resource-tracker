import { Vector2d } from "konva/lib/types";
import { Image } from "react-konva";
import useImage from "use-image";

interface Props {
  x: number;
  y: number;
  startingPosition: Vector2d;
  stageScale: Vector2d;
}

const Pin = ({ x, y, stageScale }: Props) => {
  const [image, status] = useImage(require("../dark_blue_pin.png"));
  return !!image && status === "loaded" ? (
    <Image
      x={x}
      y={y}
      offsetX={40 / 2}
      offsetY={40}
      image={image}
      width={40}
      height={40}
      scale={{ x: 1 / stageScale.x, y: 1 / stageScale.y }}
    />
  ) : null;
};

export default Pin;
