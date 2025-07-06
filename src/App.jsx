import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Landing from './components/Landing';
import Signup from './components/Signup';
import Signin from './components/Signin';
import User from './components/User';
import Employee from './components/Employee';
import Admin from './components/Admin';
import SuperAdmin from './components/SuperAdmin';
import AssignRoles from './components/AssignRoles'; // Import AssignRoles component
import ManagePermissions from './components/ManagePermissions'; // Import ManagePermissions component
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/user" element={<User />} />
        <Route path="/employee" element={<Employee />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/super_admin" element={<SuperAdmin />}> {/* Nested routes under SuperAdmin */}
          <Route path="assign_roles" element={<AssignRoles />} />
          <Route path="manage_permissions" element={<ManagePermissions />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
