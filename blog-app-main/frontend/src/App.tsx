import { Navigator } from "./navigator";
import { Toaster } from "./components";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <Toaster />
      <Navigator />
    </>
  );
};

export default App;
