import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import { Circle, Image } from "react-konva";
import useImage from "use-image";
import { PIN_HEIGHT, PIN_WIDTH } from "../constants";

interface Props {
  x: number;
  y: number;
  startingPosition: Vector2d;
  stageScale: Vector2d;
  name: string;
  url: string;
  strokeEnabled?: boolean;
  onMouseOver?: (e: KonvaEventObject<MouseEvent>) => void;
  onClick?: (e: KonvaEventObject<MouseEvent>) => void;
}

const Pin = ({
  x,
  y,
  stageScale,
  url,
  name,
  strokeEnabled,
  onMouseOver,
  onClick,
}: Props) => {
  const [image, status] = useImage(url);

  return !!image && status === "loaded" ? (
    <>
      <Image
        name={name}
        x={x}
        y={y}
        offsetX={PIN_WIDTH / 2}
        offsetY={PIN_HEIGHT}
        image={image}
        width={PIN_WIDTH}
        height={PIN_HEIGHT}
        scale={{ x: 1 / stageScale.x, y: 1 / stageScale.y }}
        strokeEnabled={strokeEnabled}
        onMouseOver={onMouseOver}
        onClick={onClick}
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
