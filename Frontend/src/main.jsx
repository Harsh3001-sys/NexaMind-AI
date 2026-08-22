import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import App from './App.jsx';
import SharePage from "./SharePage.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Routes>

    <Route
        path="/"
        element={<App />}
    />

    <Route
        path="/share/:shareId"
        element={
            <SharePage />
        }
    />

</Routes></BrowserRouter>
)
