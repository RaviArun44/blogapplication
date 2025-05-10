import { ToastContainer } from "react-toastify";
import { Bounce } from "react-toastify";

export interface IToaster {}

// const CustomToastContainer = styled(ToastContainer)`
//   font-size: 14px;

//   @media (max-width: 576px) {
//     width: 60%;
//     font-size: 12px;
//     padding: 5px;
//     margin-left: auto;
//     margin-top: 5%;
//   }
// `;

export const Toaster = ({}: IToaster) => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      transition={Bounce}
    />
  );
};
