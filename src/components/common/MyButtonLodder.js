import { RiLoader2Fill } from "react-icons/ri";

const MyButtonLoader = () => (
  <div className="my-button-loader">
    <RiLoader2Fill
      style={{
        fontSize: "15px",
        animation: "spin 1s linear infinite",
      }}
    />
  </div>
);

export default MyButtonLoader;

