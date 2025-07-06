from flask import Flask, request, jsonify, session
from flask_cors import CORS
import mysql.connector
from encryption import generate_random_string, encrypt, key_expansion

app = Flask(__name__)

# Enable CORS for specific origins
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Secret key for session management
app.secret_key = 'your_secret_key_here'  # Replace with a real secret key

# MySQL database configuration
db_config = {
    'user': 'root',
    'password': '',
    'host': 'localhost',
    'database': 'newdatabase'
}

# 32-character encryption key (256 bits)
encryption_key = "mySecureEncryptionKeyForAES256!!"

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        username = data['username']
        email = data['email']
        password = data['password']
        role = data['role']

        # Encrypt the password
        key_schedule = key_expansion(encryption_key)
        encrypted_blocks = encrypt(password, encryption_key)
        encrypted_password = ''.join(''.join(f"{byte:08x}" for byte in block) for block in encrypted_blocks)

        # Store the encrypted password in the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute('INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, %s)',
                       (username, email, encrypted_password, role))
        conn.commit()

        return {'message': 'User signed up successfully'}, 201

    except Exception as e:
        print(f"Error during signup: {e}")
        return jsonify({"error": "Unable to sign up"}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/signin', methods=['POST'])
def signin():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        query = "SELECT id, password, role FROM users WHERE email = %s"
        cursor.execute(query, (email,))
        result = cursor.fetchone()

        if result:
            user_id, stored_password, role = result

            # Encrypt the input password to compare with the stored encrypted password
            key_schedule = key_expansion(encryption_key)
            encrypted_blocks = encrypt(password, encryption_key)
            encrypted_password = ''.join(''.join(f"{byte:08x}" for byte in block) for block in encrypted_blocks)

            if stored_password == encrypted_password:
                # Set session data or authentication token
                session['user_id'] = user_id
                session['role'] = role
                return jsonify({"message": "Sign-in successful", "userRole": role}), 200
            else:
                return jsonify({"error": "Invalid password"}), 401
        else:
            return jsonify({"error": "User not found"}), 401

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cursor.close()
        connection.close()

@app.route('/logout', methods=['POST'])
def logout():
    try:
        # Clear session data
        session.pop('user_id', None)
        session.pop('role', None)
        return jsonify({"message": "Logged out successfully"}), 200
    except Exception as e:
        print(f"Error during logout: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/users', methods=['GET'])
def get_users():
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)

        # Fetch user details along with permissions
        query = "SELECT id, username, email, role, password, permissions FROM users"
        cursor.execute(query)
        users = cursor.fetchall()

        # Include decrypted passwords in the response (if needed)
        for user in users:
            user_password = user['password']
            user['password'] = user_password  # Keep the encrypted password as it is or decrypt if necessary

            # Convert permissions from comma-separated string to list (if stored as such)
            if user.get('permissions'):
                user['permissions'] = user['permissions'].split(',')
            else:
                user['permissions'] = []

        return jsonify(users), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cursor.close()
        connection.close()


@app.route('/users/<int:user_id>', methods=['PUT'])
def edit_user(user_id):
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        role = data.get('role')

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        query = "UPDATE users SET username = %s, email = %s, role = %s WHERE id = %s"
        cursor.execute(query, (username, email, role, user_id))
        connection.commit()

        return jsonify({"message": "User updated successfully"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cursor.close()
        connection.close()

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        query = "DELETE FROM users WHERE id = %s"
        cursor.execute(query, (user_id,))
        connection.commit()

        return jsonify({"message": "User deleted successfully"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cursor.close()
        connection.close()


@app.route('/users/<int:user_id>/password', methods=['PATCH'])
def change_password(user_id):
    try:
        data = request.get_json()
        new_password = data.get('newPassword')

        if not new_password:
            return jsonify({"error": "New password is required"}), 400

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        key_schedule = key_expansion(encryption_key)
        encrypted_blocks = encrypt(new_password, encryption_key)
        encrypted_new_password = ''.join(''.join(f"{byte:08x}" for byte in block) for block in encrypted_blocks)

        update_query = "UPDATE users SET password = %s WHERE id = %s"
        cursor.execute(update_query, (encrypted_new_password, user_id))
        connection.commit()

        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal server error"}), 500

    finally:
        cursor.close()
        connection.close()



@app.route('/roles', methods=['POST'])
def create_role():
    try:
        data = request.get_json()
        role_name = data.get('role_name')
        description = data.get('description')

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        query = "INSERT INTO roles (role_name, description) VALUES (%s, %s)"
        cursor.execute(query, (role_name, description))
        connection.commit()

        return jsonify({"message": "Role created successfully"}), 201

    except Exception as e:
        print(f"Error creating role: {e}")
        return jsonify({"error": "Unable to create role"}), 500

    finally:
        cursor.close()
        connection.close()

@app.route('/permissions', methods=['POST'])
def create_permission():
    try:
        data = request.get_json()
        permission_name = data.get('permission_name')
        description = data.get('description')

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        query = "INSERT INTO permissions (permission_name, description) VALUES (%s, %s)"
        cursor.execute(query, (permission_name, description))
        connection.commit()

        return jsonify({"message": "Permission created successfully"}), 201

    except Exception as e:
        print(f"Error creating permission: {e}")
        return jsonify({"error": "Unable to create permission"}), 500

    finally:
        cursor.close()
        connection.close()



@app.route('/users', methods=['POST'])
def add_user():
    try:
        data = request.json
        username = data['username']
        email = data['email']
        designation = data['designation']
        password = data['password']
        role = data['role']

        # Encrypt the password
        key_schedule = key_expansion(encryption_key)
        encrypted_blocks = encrypt(password, encryption_key)
        encrypted_password = ''.join(''.join(f"{byte:08x}" for byte in block) for block in encrypted_blocks)

        # Store the encrypted password in the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute('INSERT INTO users (username, email, designation, password, role) VALUES (%s, %s, %s, %s, %s)',
                       (username, email, designation, encrypted_password, role))
        conn.commit()

        return jsonify({'message': 'User added successfully'}), 201

    except Exception as e:
        print(f"Error adding user: {e}")
        return jsonify({"error": "Unable to add user"}), 500

@app.route('/users/<int:user_id>/permissions', methods=['PATCH'])
def assign_permission(user_id):
    cursor = None
    connection = None
    try:
        data = request.get_json()
        permission_id = data.get('permission_id')

        if not permission_id:
            return jsonify({"error": "Permission ID is required"}), 400

        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor()

        # Fetch current permissions
        fetch_query = "SELECT permissions FROM users WHERE id = %s"
        cursor.execute(fetch_query, (user_id,))
        result = cursor.fetchone()

        if result:
            current_permissions = result[0]

            # Handle permissions based on the type in the database
            if isinstance(current_permissions, str):
                # Convert from comma-separated string to list
                current_permissions = current_permissions.split(',')
            elif isinstance(current_permissions, list):
                # Already in list format
                pass
            else:
                # Default to empty list if the format is unexpected
                current_permissions = []

            # Ensure permission_id is a string and add it if not already present
            if not isinstance(permission_id, str):
                return jsonify({"error": "Invalid permission ID format"}), 400
            
            if permission_id not in current_permissions:
                current_permissions.append(permission_id)

            # Convert list back to a comma-separated string
            new_permissions = ','.join(current_permissions)

            # Update permissions in the database
            update_query = "UPDATE users SET permissions = %s WHERE id = %s"
            cursor.execute(update_query, (new_permissions, user_id))
            connection.commit()

            return jsonify({"message": "Permission assigned successfully"}), 200
        else:
            return jsonify({"error": "User not found"}), 404

    except mysql.connector.Error as db_error:
        print(f"Database error: {db_error}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        print(f"Error assigning permission: {e}")
        return jsonify({"error": "Internal server error"}), 500

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()





if __name__ == '__main__':
    app.run(debug=True)
