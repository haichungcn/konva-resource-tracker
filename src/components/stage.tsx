import { Stage, StageProps } from "react-konva";
import Konva from "konva";
import Controllers from "./controllers";
import { forwardRef, useCallback, useRef, useState } from "react";
import { debounce } from "lodash";
import { Vector2d } from "konva/lib/types";
import { KonvaEventObject } from "konva/lib/Node";
import styled from "styled-components";
import { Dimension, ScaleLimit, StageChildren } from "../type";
import {
  DEFAULT_SCALE,
  SCALE_LIMIT,
  DEFAULT_POSITION,
  ZOOM_STEP,
  STAGE_WIDTH,
  STAGE_HEIGHT,
} from "../constants";

const getNewPositionRelativeToStageCenter = (
  stagePosition: Vector2d,
  stageDimension: Dimension,
  oldScale: Vector2d,
  newScale: Vector2d,
) => {
  const targetPoint = {
    x: stageDimension.width / 2,
    y: stageDimension.height / 2,
  };
  const relativeOldPosition = {
    x: (targetPoint.x - stagePosition.x) / oldScale.x,
    y: (targetPoint.y - stagePosition.y) / oldScale.x,
  };

  return {
    x: targetPoint.x - relativeOldPosition.x * newScale.x,
    y: targetPoint.y - relativeOldPosition.y * newScale.y,
  };
};

interface Props {
  children: StageChildren;
}

const ComposibleStage = ({ children }: Props) => {
  const stage = useRef<Konva.Stage>(null);

  const [scale, setScale] = useState<Vector2d>(DEFAULT_SCALE);
  const [scaleLimit, setScaleLimit] = useState<ScaleLimit>(SCALE_LIMIT);
  const [stagePosition, setStagePosition] =
    useState<Vector2d>(DEFAULT_POSITION);
  const [startingPosition, setStartingPosition] =
    useState<Vector2d>(DEFAULT_POSITION);

  const adjustNewPosition = (newScale: Vector2d) => {
    if (!stage.current) return;
    const oldScale = stage.current.scale() ?? DEFAULT_SCALE;
    const newPosition = getNewPositionRelativeToStageCenter(
      { x: stage.current.x(), y: stage.current.y() },
      { width: stage.current.width(), height: stage.current.height() },
      oldScale,
      newScale,
    );
    setStagePosition(newPosition);
  };

  const handleZoomIn = useCallback(
    debounce(() => {
      const getNewScale = (prev: Vector2d) => ({
        x: Math.min(prev.x + ZOOM_STEP, scaleLimit.MAX),
        y: Math.min(prev.y + ZOOM_STEP, scaleLimit.MAX),
      });
      setScale((prev) => {
        return getNewScale(prev);
      });

      if (!!stage.current) {
        adjustNewPosition(getNewScale(stage.current.scale() ?? DEFAULT_SCALE));
      }
    }, 100),
    [scaleLimit],
  );
  const handleZoomOut = useCallback(
    debounce(() => {
      const getNewScale = (prev: Vector2d) => ({
        x: Math.max(prev.x - ZOOM_STEP, scaleLimit.MIN),
        y: Math.max(prev.y - ZOOM_STEP, scaleLimit.MIN),
      });
      setScale((prev) => {
        return getNewScale(prev);
      });
      if (!!stage.current) {
        adjustNewPosition(getNewScale(stage.current.scale() ?? DEFAULT_SCALE));
      }
    }, 100),
    [scaleLimit],
  );
  const handleOnMouseWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      // stop default scrolling
      e.evt.preventDefault();
      if (e.currentTarget instanceof Konva.Stage) {
        const stage = e.currentTarget;

        const oldScale = stage.scale()?.x ?? DEFAULT_SCALE.x;
        const pointer = stage.getPointerPosition();

        if (!pointer) return;

        const mousePointTo = {
          x: (pointer.x - stage.x()) / oldScale,
          y: (pointer.y - stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? 1 : -1;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
          direction = -direction;
        }

        const newScale =
          direction > 0
            ? Math.min(oldScale + ZOOM_STEP, scaleLimit.MAX)
            : Math.max(oldScale - ZOOM_STEP, scaleLimit.MIN);

        setScale({ x: newScale, y: newScale });

        const newPos = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };
        setStagePosition(newPos);
      }
    },
    [scaleLimit],
  );

  const handleOnMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.currentTarget instanceof Konva.Stage) {
      e.currentTarget.container().style.cursor = "grabbing";
    }
  };

  const handleOnMouseUp = (e: KonvaEventObject<MouseEvent>) => {
    if (e.currentTarget instanceof Konva.Stage) {
      e.currentTarget.container().style.cursor = "grab";
    }
  };

  const handleOnDblClick = (e: KonvaEventObject<MouseEvent>) => {
    if (e.currentTarget instanceof Konva.Stage) {
      setScale(DEFAULT_SCALE);
      e.currentTarget.setPosition(DEFAULT_POSITION);
    }
  };
  return (
    <Container>
      <StyledStage
        ref={stage}
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        x={stagePosition.x}
        y={stagePosition.y}
        scale={scale}
        onWheel={handleOnMouseWheel}
        onMouseDown={handleOnMouseDown}
        onMouseUp={handleOnMouseUp}
        onDblClick={handleOnDblClick}
        draggable
      >
        {children({ startingPosition, setStartingPosition, scale })}
      </StyledStage>
      <Controllers
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={() => setScale(DEFAULT_SCALE)}
        currentScale={scale.x.toFixed(1)}
      />
    </Container>
  );
};

export default ComposibleStage;

const Container = styled.div`
  position: relative;
  width: ${STAGE_WIDTH}px;
  height: ${STAGE_HEIGHT}px;
`;

const StyledStage = styled(
  forwardRef<Konva.Stage, StageProps>((props, ref) => (
    <Stage {...props} ref={ref} />
  )),
)`
  border: 1px solid #d8dade;
  width: ${STAGE_WIDTH};
  height: ${STAGE_HEIGHT};
  background-color: #f1f3f9;
  cursor: move; /* fallback if grab cursor is unsupported */
  cursor: grab;
  cursor: -moz-grab;
  cursor: -webkit-grab;
`;
