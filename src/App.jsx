// App.jsx
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './app/router/AppRouter';
import { store } from './store';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRouter />
        
      </BrowserRouter>
    </Provider>
  );
}
