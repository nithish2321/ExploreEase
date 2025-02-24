import React from 'react'
import { Container, Row, Col, Button } from "reactstrap";
import Profile1 from "./Profile1"
import BookingHistory from "./BookingHistory"
export default function Profile() {
  return (
   <>
   <section>

    <Container>
      <Row>
        <Col lg="6">
            <Profile1 />
        </Col>
        <Col lg="6">
            <BookingHistory />
        </Col>
      </Row>
    </Container>

   </section>

   </>  
   )
}
