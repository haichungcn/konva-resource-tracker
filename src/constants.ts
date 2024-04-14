import { Vector2d } from "konva/lib/types";
import { ScaleLimit } from "./type";

export const MOCK_FLOOR_URL =
  "https://meatsciences.cals.wisc.edu/wp-content/uploads/sites/371/2016/02/Level-1-Floor-Plan.png";
export const STAGE_WIDTH = 900;
export const STAGE_HEIGHT = 800;
export const ZOOM_STEP = 0.2;
export const DEFAULT_SCALE: Vector2d = { x: 1, y: 1 };
export const DEFAULT_POSITION: Vector2d = { x: 0, y: 0 };
export const SCALE_LIMIT: ScaleLimit = {
  MIN: 1,
  MAX: 6,
};
