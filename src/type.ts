import { Vector2d } from "konva/lib/types";
import Konva from "konva";

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
  stage: React.MutableRefObject<Konva.Stage | null>;
  onZoomIn: (targetScale: Vector2d, targetPosition: Vector2d) => void;
}

export type StageChildren = (props: StageChildrenProps) => React.JSX.Element;

export interface PinItem {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GroupItem {
  x: number;
  y: number;
  children: PinItem[];
  size: number;
  unGroupScale: number; // at which scale should the group formed
}
