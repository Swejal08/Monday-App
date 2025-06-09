import { toast } from 'react-toastify';

const useNotification = () => {
  const successNotification = (message: string) => {
    toast.success(message);
  };

  const errorNotification = (message: string) => {
    toast.error(message);
  };

  return { successNotification, errorNotification };
};

export default useNotification;
