import { Component } from "react";
import { BlobServiceClient } from "@azure/storage-blob";
import { Container, Row, Col, Button, Table } from "react-bootstrap";

import "bootstrap/dist/css/bootstrap.min.css";

import './App.css'

// Init Storage Info
const storageAccountName = "innerscape";
const sasToken =
  "sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2024-10-25T02:52:02Z&st=2023-10-24T18:52:02Z&spr=https&sig=mb0bsH0KrU%2Bvo9kFSi66ahif1tdkcZnen4FfKqqjMIQ%3D";
const containerName = "default";

const blobService = new BlobServiceClient(
  `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
);
const containerClient = blobService.getContainerClient(containerName);

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      blobItems: [],
      textContents: [],
    };
  }

  async getFiles() {
    this.setState(() => ({ blobItems: [] }));
    try {
      for await (const blob of containerClient.listBlobsFlat()) {
        this.setState((prevState) => ({
          blobItems: [...prevState.blobItems, blob.name],
        }));
      }
    } catch (error) {
      console.error("Error listing files:", error);
    }
  }

  async fetchTextTest(_fileName) {
    this.setState(() => ({ textContents: [] }));

    const txt = fetch(
      `https://${storageAccountName}.blob.core.windows.net/${containerName}/${_fileName}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then((textContent) => {
        textContent.split(/\n/).map((line) => {
          this.setState((prevState) => ({
            textContents: [...prevState.textContents, line],
          }));
        });
      })
      .catch((error) => {
        console.error("Error fetching text file:", error);
      });
  }

  render() {
    return (
      <>
        <Container>
          <Row>
            <Col xs={4}>
              <Button variant="primary" onClick={() => this.getFiles() }>
                {" "}
                Get Files
              </Button>

              <ul>
              <div className="d-grid gap-2">
                {this.state.blobItems.map((item, index) => (
                  <Button
                    variant="outline-info"
                    key={index}
                    onClick={() => this.fetchTextTest(item)}
                  >
                    {item}
                  </Button>
                ))}
                </div>
              </ul>
            </Col>
            <Col xs={8}>
              <Table striped bordered hover>
                <tbody>
                  {this.state.textContents.map((line, index) => (
                    <tr key={index}>
                    {line.split(",").map((item, index) => (<td key={index}>{item}</td>))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default App;