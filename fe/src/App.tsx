import { useEffect } from 'react';
import '@/App.css';
import monday from 'monday-sdk-js';
import Multiplier from '@/components/Multiplier';
import { ToastContainer } from 'react-toastify';

const mondayClient = monday();

function App() {
  useEffect(() => {
    mondayClient.listen('context', () => {
      console.log('Monday context loaded');
    });
  }, []);

  return (
    <>
      <Multiplier />;
      <ToastContainer />
    </>
  );
}

export default App;
