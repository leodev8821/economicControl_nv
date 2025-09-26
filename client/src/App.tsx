import IncomeList from './components/features/IncomeList/IncomeList';

function App() {

  return (
    <>
      <header>
        {/* Aquí iría la barra de navegación */}
        <h1>Control Económico NV</h1>
      </header>
      
      <main>
        {/* 👈 USA EL COMPONENTE DE LA LISTA DE INGRESOS */}
        <IncomeList />
      </main>
    </>
  );
}

export default App;