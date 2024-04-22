import { Vector2d } from "konva/lib/types";
import { ScaleLimit } from "./type";

export const STAGE_WIDTH = 900;
export const STAGE_HEIGHT = 800;
export const ZOOM_STEP = 0.2;
export const DEFAULT_SCALE: Vector2d = { x: 1, y: 1 };
export const DEFAULT_POSITION: Vector2d = { x: 0, y: 0 };
export const SCALE_LIMIT: ScaleLimit = {
  MIN: 1,
  MAX: 6,
};
