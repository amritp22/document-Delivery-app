import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Header = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // clears token, name from localStorage + context
    navigate("/login");
  };

  const isAgent = auth?.role === "AGENT";

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">CityCourier</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto">
            {isAgent ?(
            <>
              <Nav.Link as={Link} to="/pending">All Pending order</Nav.Link>
              <Nav.Link as={Link} to="/assingedorder">Assigned Orders</Nav.Link>
            </>
            ):(
            <>
              <Nav.Link as={Link} to="/create">Delivery Request</Nav.Link>
              <Nav.Link as={Link} to="/orders">See Orders</Nav.Link>
            </>
            )}
            
            {auth?.token ? (
              <NavDropdown title={auth.name} id="user-nav-dropdown">
                <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login">Sign In</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
