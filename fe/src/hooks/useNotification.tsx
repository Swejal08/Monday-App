import { toast } from 'react-toastify';

const useNotification = () => {
  const successNotification = (message: string) => {
    toast.success(message, {
      autoClose: 2000,
    });
  };

  const errorNotification = (message: string) => {
    toast.error(message, {
      autoClose: 2000,
    });
  };

  return { successNotification, errorNotification };
};

export default useNotification;
