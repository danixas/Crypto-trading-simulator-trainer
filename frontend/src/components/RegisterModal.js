import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext'; // Ensure you import useAuth

const RegisterModal = ({ show, handleClose }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth(); // Use register function from context, make sure to define it in AuthContext

    const handleRegister = async (event) => {
        event.preventDefault();
        try {
            await register(username, password);
            console.log('Registration successful');
            handleClose(); // Close the modal on successful registration
        } catch (error) {
            console.error('Failed to register:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Register</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleRegister}>
                    <Form.Group controlId="registerUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group controlId="registerPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Register
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default RegisterModal;
