import { Vector2d } from "konva/lib/types";

export interface ScaleLimit {
  MAX: number;
  MIN: number;
}

export interface Dimension {
  width: number;
  height: number;
}

export type ImageStatus = "loaded" | "loading" | "failed";

export interface StageChildrenProps {
  startingPosition: Vector2d;
  setStartingPosition: (pos: Vector2d) => void;
  scale: Vector2d;
}

export type StageChildren = (props: StageChildrenProps) => React.JSX.Element;
