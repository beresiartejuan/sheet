import { MathApp } from './components/MathApp';
import { useTheme } from './hooks/useTheme';

function App() {
  // Inicializar el tema a nivel de App para que persista
  useTheme();
  
  return <MathApp />;
}

export default App;