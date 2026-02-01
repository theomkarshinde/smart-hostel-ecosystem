import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthContextProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthContextProvider>
                <NotificationProvider>
                    <App />
                </NotificationProvider>
            </AuthContextProvider>
        </BrowserRouter>
    </React.StrictMode>,
)
