import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-light text-center py-5">
        <Container>
          <h1 className="display-4 fw-bold text-primary">CityCourier</h1>
          <p className="lead text-secondary">
            Transfer your documents or personal items across the city with ease and reliability.
          </p>
          <Button as={Link} to="/create" variant="warning" size="lg">
            Get Started
          </Button>
        </Container>
      </section>

      {/* How It Works */}
      <section className="py-5 bg-light text-center">
        <Container>
          <h2 className="mb-4 text-primary">How It Works</h2>
          <Row className="g-4 justify-content-center">
            {[
              {
                title: "Place Request",
                image: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
              },
              {
                title: "Assigned",
                image: "https://cdn-icons-png.flaticon.com/512/2601/2601922.png",
              },
              {
                title: "Pickup",
                image: "https://cdn-icons-png.flaticon.com/512/1088/1088537.png",
              },
              {
                title: "Track",
                image: "https://cdn-icons-png.flaticon.com/512/2961/2961365.png",
              },
              {
                title: "Delivered",
                image: "https://cdn-icons-png.flaticon.com/512/2838/2838912.png",
              },
            ].map((step, index) => (
              <Col key={index} md={2} sm={4} xs={6}>
                <img
                  src={step.image}
                  alt={step.title}
                  className="img-fluid mb-2"
                  style={{ maxHeight: "80px" }}
                />
                <h6>{step.title}</h6>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Image Grid Section */}
      <section className="container my-5">
        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <img src="/images/delivery1.jpeg" alt="Courier" className="img-fluid rounded shadow" />
          </div>
          <div className="col-md-6 col-lg-3">
            <img src="/images/delivery4.webp" alt="Package" className="img-fluid rounded shadow" />
          </div>
          <div className="col-md-6 col-lg-3">
            <img src="/images/delivery2.webp" alt="Delivery" className="img-fluid rounded shadow" />
          </div>
          <div className="col-md-6 col-lg-3">
            <img src="/images/delivery3.avif" alt="Bike" className="img-fluid rounded shadow" />
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h3 className="text-primary mb-3">Why Choose CityCourier?</h3>
              <ul className="list-unstyled fs-5">
                <li>🚀 Fast and reliable delivery</li>
                <li>📍 Track your item in real-time</li>
                <li>💵 Transparent pricing</li>
                <li>🔒 Secure handling of documents</li>
              </ul>
              <Button as={Link} to="/create" variant="primary" size="md">
                Request a Delivery
              </Button>
            </Col>
            <Col md={6}>
              <img
                src="/images/delivery5.jpg"
                alt="Courier Illustration"
                className="img-fluid rounded"
              />
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
