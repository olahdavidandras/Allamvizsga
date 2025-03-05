import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ImageEnhance from './components/ImageEnhance';
import AuthForm from './components/AuthForm';

const App = () => {
    return (
        <div>
            <AuthForm isLogin={false} /> 
            <AuthForm isLogin={true} /> 
            <ImageEnhance />
        </div>
    );
};

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);
