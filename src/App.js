import './App.css';
import LineChart from './conponents/lineChart';
import PieChart from './conponents/pieChart';
import YearMonthDropdown from './conponents/pullDown';
import NumberInputForm from './conponents/button';

function App() {
  return (
    <div className="App">
      <h2>Line Chart</h2>
      <LineChart />
      <h2>Pie Chart</h2>
      <PieChart />
      <h2>Pull Down</h2>
      <YearMonthDropdown />
      <h2>Number Input Form</h2>
      <NumberInputForm />
    </div>
  );
}

export default App;
