import ResourceTracker from "./components/resource-tracker";
import { MOCK_FLOOR_URL } from "./constants";
import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <h1>Konva Resource Tracker</h1>
      <ResourceTracker
        floorplanURL={MOCK_FLOOR_URL}
        pinURL={require("./images/dark_blue_pin.png")}
        selectedPin={15}
      />
    </div>
  );
}
