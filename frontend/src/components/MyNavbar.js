import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Container, Form, InputGroup } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { LinkContainer } from 'react-router-bootstrap';

const MyNavbar = () => {
    const navigate = useNavigate();
    const { isLoggedIn, logout, balance, fetchBalance, updateBalance } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [newBalance, setNewBalance] = useState('');

    useEffect(() => {
        if (isLoggedIn) {
            fetchBalance();
        }
    }, [isLoggedIn, fetchBalance]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        await updateBalance(parseFloat(newBalance));
        setNewBalance('');
    };
    return (
        <>
            <Navbar bg="light" expand="lg">
                <Container fluid>
                    <Navbar.Brand href="#" onClick={() => navigate('/dashboard')}>Home</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            {!isLoggedIn ? (
                                <>
                                    <Button variant="outline-success" onClick={() => setShowLogin(true)} className="me-2">Login</Button>
                                    <Button variant="outline-primary" onClick={() => setShowRegister(true)}>Register</Button>
                                </>
                            ) : (
                                <>
                                    <span className="navbar-text me-2">
                                        Balance: ${balance.toFixed(2)}
                                    </span>
                                    <InputGroup as={Form} onSubmit={handleSubmit} className="me-2">
                                        <InputGroup.Text>$</InputGroup.Text>
                                        <Form.Control
                                            type="number"
                                            value={newBalance}
                                            onChange={e => setNewBalance(e.target.value)}
                                            placeholder="Update balance"
                                        />
                                        <Button variant="outline-success" className="me-2" type="submit">Reset Balance</Button>
                                    </InputGroup>
                                    <Button variant="outline-primary" onClick={() => navigate('/profile')} className="me-2">Profile</Button>
                                    <Button variant="outline-danger" onClick={handleLogout} className="ms-2">Logout</Button>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <LoginModal show={showLogin} handleClose={() => setShowLogin(false)} />
            <RegisterModal show={showRegister} handleClose={() => setShowRegister(false)} />
        </>
    );
};

export default MyNavbar;
