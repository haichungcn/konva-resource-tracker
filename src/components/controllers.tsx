import styled from "styled-components";

interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomToPin: () => void;
  onResetZoom: () => void;

  currentScale: string;
  selectedPin: number;
}

const Controllers = ({
  onZoomIn,
  onZoomOut,
  onZoomToPin,
  currentScale,
  selectedPin,
}: Props) => {
  return (
    <>
      <div style={{ position: "absolute", top: -42, left: 0 }}>
        <button className="zoom-to-pin_btn" onClick={onZoomToPin}>
          Zoom to a pin {selectedPin} (green dot)
        </button>
      </div>
      <Container>
        <button onClick={onZoomIn}>+</button>
        <button onClick={onZoomOut}>-</button>
      </Container>
      <div>Current Zoom Level: {currentScale}, Double Click to reset</div>
    </>
  );
};

export default Controllers;

const Container = styled.div`
  position: absolute;
  right: 35px;
  bottom: 40px;
  box-shadow: 0px 6px 10px 0px #292d3726;
  width: 34px;
  border-radius: 5px;
  > button {
    width: 100%;
    height: 36px;
    background-color: white;
    border: 1px solid #d8dade;
    font-size: 20px;
    font-weight: 400;
    color: #292d37;
    margin-top: -1px;
    cursor: pointer;

    &:first-child {
      border-radius: 5px 5px 0 0;
      margin-top: 0;
    }
    &:last-child {
      border-radius: 0 0 5px 5px;
    }
  }
`;
