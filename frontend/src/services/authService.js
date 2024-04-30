const API_BASE_URL = 'http://localhost:8000/api/users';

export const register = async(username, password) => {
    const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
        const data = await response.json();
        console.log("Registration successful", data);
        return data;
    } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
    }
}

export const login = async(username, password) => {
    const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
        const data = await response.json();
        console.log("Login successful", data);
        return data;
    } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid credentials");
    }
}

