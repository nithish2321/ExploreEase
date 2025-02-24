import React from 'react'
import { Container, Row,Col } from "reactstrap";
import Subtitle from "../../shared/Subtitle";
import MasonryImagesGallery from "../Image-gallery/MasonryImagesGallery";
import Newsletter from "../../shared/Newsletter";
export default function Gallary() {
  return (
    <><section>
    <Container>
      <Row>
        <Col lg="12">
          <Subtitle subtitle={"Gallery"}/>
          <h2 className="gallery__title">Visit our Customers tour gallery</h2>
        </Col>
        <Col lg="12">
          <MasonryImagesGallery/>
        </Col>
      </Row>
    </Container>
  </section>
  <Newsletter/>
  </>
  )
}
