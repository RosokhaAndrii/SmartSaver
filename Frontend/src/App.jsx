import React, { useState } from 'react';
import { Outlet } from 'react-router';
import SideBarNav from './layouts/SideBarNav/SideBarNav';
import Header from './layouts/Header/Header';
import './App.css';
export default function App() {
  const [pageName, setPageName] = useState(''); 

  return (
    <div >
      <SideBarNav />
      <div >
        <Header pageName={pageName} />
        <main>
          <Outlet context={{ setPageName }} />
        </main>
      </div>
    </div>
  );
}
