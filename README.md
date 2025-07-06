# Secure-Role-Based-Access-Management-System

## 📌 Project Overview

SRBAMS is a secure, scalable, and role-based web application designed to manage users and permissions within an organization. Built with **ReactJS** for a dynamic frontend and **Flask + MySQL** for a robust backend, this system supports four user roles: **Superadmin, Admin, Employee, and User**. Sensitive data like passwords is encrypted using **AES (Advanced Encryption Standard)** to ensure data protection and security.

## 🚀 Features

- **Role-Based Access Control (RBAC)** with 4 user types:
  - **Superadmin**: Full access to manage users, roles, and permissions.
  - **Admin**: Can create/edit users but with limited permissions.
  - **Employee**: Access to their own dashboard and data only.
  - **User**: End-user with minimal access.
- **Secure Password Management** with AES encryption.
- **Seamless Frontend-Backend Integration** via RESTful APIs.
- **User-specific Dashboards** based on roles.
- **Data stored securely** in MySQL with Flask serving as the backend API layer.

## 🧑‍💻 Technology Stack

### 🔹 Frontend
- ReactJS
- Axios (for API communication)
- React Router (for routing based on roles)

### 🔹 Backend
- Flask (Python)
- MySQL (Relational database)
- PyCryptodome (for AES encryption)
- Flask-CORS, Flask-RESTful

### 🔹 Security
- AES Encryption for password storage.
- Role-Based Access Control (RBAC) for feature restriction.

## 🛡️ Roles and Permissions

| Role       | Dashboard Access | Create/Edit Users | Assign Roles | Change Passwords |
|------------|------------------|-------------------|--------------|------------------|
| Superadmin | ✅ Yes           | ✅ Yes            | ✅ Yes       | ✅ Yes           |
| Admin      | ✅ Yes           | ✅ Yes            | ❌ No        | ❌ No            |
| Employee   | ✅ Yes (own)     | ❌ No             | ❌ No        | ❌ No            |
| User       | ✅ Yes (own)     | ❌ No             | ❌ No        | ❌ No            |

## 🔒 Security Considerations

- All passwords are **AES encrypted** before being stored in the database.
- Role-based authentication ensures that only users with appropriate permissions can access sensitive data or features.
