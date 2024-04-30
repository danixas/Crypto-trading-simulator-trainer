import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { LinkContainer } from 'react-router-bootstrap';

const MyNavbar = () => {
    const navigate = useNavigate();
    const { isLoggedIn, logout } = useAuth();
    const [showLogin, setShowLogin] = React.useState(false);
    const [showRegister, setShowRegister] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    useEffect(() => {
        console.log("Authentication status changed:", isLoggedIn);
    }, [isLoggedIn]);

    return (
        <>
        <Navbar bg="light" expand="lg">
            <Container fluid>
                <Navbar.Brand href="#" onClick={() => navigate('/')}>Home</Navbar.Brand>
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
                                <LinkContainer to="/profile">
                                    <Nav.Link><i className="bi bi-person-circle"></i></Nav.Link>
                                </LinkContainer>
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
