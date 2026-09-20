import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Routers from './Routers'; 
import { Provider } from "react-redux";
import  store  from "./redux/store";

import 'react-circular-progressbar/dist/styles.css';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
    <Routers />
    </Provider>
);


