import { Stage, StageProps, Layer, Circle, Text } from "react-konva";
import Konva from "konva";
import Controllers from "./controllers";
import {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
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
import { findNodes, findPin } from "../utils";

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
  activePin: number | null;
  children: StageChildren;
  enableTooltip: boolean;
}

const ComposibleStage = ({ activePin, enableTooltip, children }: Props) => {
  const stage = useRef<Konva.Stage>(null);
  const tooltip = useRef<Konva.Text>(null);

  const [scale, setScale] = useState<Vector2d>(DEFAULT_SCALE);
  const [scaleLimit, setScaleLimit] = useState<ScaleLimit>(SCALE_LIMIT);
  const [stagePosition, setStagePosition] =
    useState<Vector2d>(DEFAULT_POSITION);
  const [startingPosition, setStartingPosition] =
    useState<Vector2d>(DEFAULT_POSITION);
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);

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
    debounce((targetScale?: Vector2d) => {
      const getNewScale = (prev: Vector2d) => ({
        x: Math.min(targetScale?.x ?? prev.x + ZOOM_STEP, scaleLimit.MAX),
        y: Math.min(targetScale?.y ?? prev.y + ZOOM_STEP, scaleLimit.MAX),
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

  const handleOnMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (
      enableTooltip &&
      e.currentTarget instanceof Konva.Stage &&
      !!tooltip.current
    ) {
      const stage = e.currentTarget;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const pointerPos = {
        x: (pointer.x + 5 - stage.x()) / scale.x,
        y: (pointer.y + 5 - stage.y()) / scale.y,
      };
      tooltip.current.setPosition(pointerPos);
      tooltip.current.setText(
        `${pointerPos.x.toFixed(2)}x${pointerPos.y.toFixed(2)}`,
      );
      setTooltipVisible(true);
    }
  };

  const handleOnMouseLeave = () => {
    setTooltipVisible(false);
  };

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
      setStagePosition(DEFAULT_POSITION);
    }
  };

  const handleZoomToPin = (pinIdx: number) => {
    if (!stage.current) return;
    const pins = findNodes(stage.current, findPin(`pin#${pinIdx}`));
    if (!pins.length) return;
    const stageRef = stage.current;
    const pin = pins[0];
    const scale = stageRef.scale()?.x ?? DEFAULT_SCALE.x;
    const stageCenter = {
      x: (stageRef.width() / 2 - stageRef.x()) / scale,
      y: (stageRef.height() / 2 - stageRef.y()) / scale,
    };
    const relativePinPos = {
      x: (pin.x() - stageRef.x()) / scale,
      y: (pin.y() - stageRef.y()) / scale,
    };
    const newScale = 3;

    setScale({ x: newScale, y: newScale });

    const newPosition = {
      x: stageCenter.x - relativePinPos.x * newScale,
      y: stageCenter.y - relativePinPos.y * newScale,
    };

    setStagePosition(newPosition);
  };

  const handleOnDragEnd = () => {
    if (!stage.current) return;
    setStagePosition({
      x: stage.current.x(),
      y: stage.current.y(),
    });
  };

  useEffect(() => {
    if (!!activePin) handleZoomToPin(activePin);
  }, [activePin]);

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
        onMouseMove={handleOnMouseMove}
        onMouseLeave={handleOnMouseLeave}
        onMouseDown={handleOnMouseDown}
        onMouseUp={handleOnMouseUp}
        onDblClick={handleOnDblClick}
        onDragEnd={handleOnDragEnd}
        draggable
      >
        {children({
          startingPosition,
          setStartingPosition,
          scale,
          stage,
          onZoomIn: handleZoomIn,
        })}
        <Layer>
          <Circle
            name="starting-position"
            x={startingPosition.x}
            y={startingPosition.y}
            width={8}
            height={8}
            fill={"pink"}
            scale={{ x: 1 / scale.x, y: 1 / scale.y }}
          />
          <Circle
            name="stage-center"
            x={STAGE_WIDTH / 2 - stagePosition.x}
            y={STAGE_HEIGHT / 2 - stagePosition.y}
            width={8}
            height={8}
            fill={"cyan"}
            scale={{ x: 1 / scale.x, y: 1 / scale.y }}
          />
          {enableTooltip && (
            <Text
              name="tooltip"
              ref={tooltip}
              fontSize={12}
              padding={5}
              fill={"red"}
              alpha={0.75}
              visible={tooltipVisible}
            />
          )}
        </Layer>
      </StyledStage>
      <Controllers
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={() => setScale(DEFAULT_SCALE)}
      />
      <InfoPanel>
        <div>
          Current Zoom Level: <b>{scale.x.toFixed(1)}</b>
        </div>
        <div>Double Click to reset</div>
      </InfoPanel>
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

const InfoPanel = styled.div`
  position: absolute;
  left: 5px;
  top: 5px;
  text-align: left;
  font-size: 12px;
  color: grey;
`;
