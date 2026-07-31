import empowerTimeBookUrl from './assets/EmpowerTime_El_empresario_del_Reino.pdf';
import { PdfReader } from './components/PdfReader';
import './App.css';

export function App() {
  return (
    <div className="app-container">
      <PdfReader source={empowerTimeBookUrl} />
    </div>
  );
}

export default App;
