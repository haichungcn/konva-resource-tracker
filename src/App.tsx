import { useState } from "react";
import styled from "styled-components";
import ResourceTracker from "./components/resource-tracker";
import "./styles.css";

const SELECTED_PIN = 15;
const FLOOR_PLANS = [
  "https://meatsciences.cals.wisc.edu/wp-content/uploads/sites/371/2016/02/Level-1-Floor-Plan.png",
  "https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs2/126534654/original/7141cff7da6f21f5957b71335415e4aabd6a6918/design-multi-story-plans-for-commercial-buildings.jpg",
  "https://images.ctfassets.net/z78475or6i3d/vF8S45DcCIGdnw7q4HOqr/eb23a24af3de5d4701d235cea256b7ba/Screen_Shot_2023-04-14_at_2.19.14_PM.png",
];

export default function App() {
  const [activePin, setActivePin] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [floorplanURL, setFloorplanURL] = useState<string>(FLOOR_PLANS[0]);

  const changeFloorplan = () => {
    setFloorplanURL(FLOOR_PLANS[Math.floor(Math.random() * 2)]);
  };

  return (
    <div className="App">
      <h1>Konva Resource Tracker</h1>

      <ButtonContainer>
        <Button
          onClick={() => {
            setActivePin(SELECTED_PIN);
            setTimeout(() => setActivePin(null), 1000);
          }}
        >
          Zoom to pin 15 (greendot)
        </Button>

        <Button onClick={changeFloorplan}>Change to another floorplan</Button>

        <ButtonWithCheckbox onClick={() => setShowTooltip((prev) => !prev)}>
          <input
            id="show-tooltip-checkbox"
            type="checkbox"
            checked={showTooltip}
            readOnly
          />
          <label
            htmlFor="show-tooltip-checkbox"
            onClick={(e) => e.preventDefault()}
          >
            Enable Tooltip
          </label>
        </ButtonWithCheckbox>

        <ButtonWithCheckbox onClick={() => setShowGrid((prev) => !prev)}>
          <input
            id="show-grid-checkbox"
            type="checkbox"
            checked={showGrid}
            readOnly
          />
          <label
            htmlFor="show-grid-checkbox"
            onClick={(e) => e.preventDefault()}
          >
            Enable Grid
          </label>
        </ButtonWithCheckbox>
      </ButtonContainer>

      <ResourceTracker
        floorplanURL={floorplanURL}
        pinURL={require("./images/dark_blue_pin.png")}
        selectedPin={SELECTED_PIN}
        activePin={activePin}
        enableTooltip={showTooltip}
        enableGrid={showGrid}
      />
    </div>
  );
}

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 16px;
`;

const Button = styled.button`
  height: 27px;
  padding: 2px 8px;
`;

const ButtonWithCheckbox = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 2px 8px;
`;
