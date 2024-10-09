# Threat Mosaic Application

Welcome to the **Threat Mosaic Application** repository! This application is a tool for visualizing and managing threat scenarios, techniques, and mitigations using an interactive graph interface. Built with **React**, **D3.js**, **Flask**, and **Neo4j**, it allows users to search, explore, and create new threat scenarios directly from the web interface.

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Set Up Environment Variables](#2-set-up-environment-variables)
  - [3. Build and Run Docker Containers](#3-build-and-run-docker-containers)
  - [4. Install Front-End Dependencies](#4-install-front-end-dependencies)
  - [5. Start the React Application](#5-start-the-react-application)
- [Usage](#usage)
  - [Access the Application](#access-the-application)
  - [Explore the Graph](#explore-the-graph)
  - [Search Nodes](#search-nodes)
  - [Create New Threat Scenarios](#create-new-threat-scenarios)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
  - [Base URL](#base-url)
  - [Endpoints](#endpoints)
    - [1. Get Threat Scenarios](#1-get-threat-scenarios)
    - [2. Search Nodes](#2-search-nodes)
    - [3. Create Threat Scenario](#3-create-threat-scenario)
- [Contributing](#contributing)
- [Acknowledgments](#acknowledgments)
- [Additional Documentation](#additional-documentation)
  - [Setting Up the Neo4j Database](#setting-up-the-neo4j-database)
  - [API Development Notes](#api-development-notes)
  - [Deployment](#deployment)
  - [Frequently Asked Questions](#frequently-asked-questions)
- [Support](#support)

---

## Features

- **Interactive Graph Visualization**: Explore threat scenarios, techniques, and mitigations through an interactive graph powered by D3.js.
- **Search Functionality**: Quickly find nodes using the search bar.
- **Node Details**: View detailed information about nodes by clicking on them.
- **Create New Threat Scenarios**: Add new threat scenarios directly from the web interface.
- **Dynamic Updates**: The graph updates in real-time as new data is added.
- **Responsive Design**: The interface is optimized for various screen sizes.
- **Error Handling and Loading Indicators**: Provides feedback to users during data fetching and error situations.

---

## Demo

![Threat Detection Graph Screenshot](https://github.com/jsaveker/ThreatMosaic/blob/fd5d06a8c228a926b32f679f2dcbc19af52b4552/Threat_Mosaic.png)

---

## Architecture

The application consists of three main components:

1. **Front-End**: Built with **React** and **D3.js**, it provides an interactive user interface for visualizing and interacting with the threat graph.
2. **Back-End API**: A **Flask** application that serves API endpoints for data retrieval and manipulation.
3. **Database**: **Neo4j** is used as the graph database to store nodes and relationships.

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker** and **Docker Compose**: For containerized deployment.
- **Node.js** and **npm**: For running the React application.

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/threat-detection-app.git
cd threat-detection-app
```
### 2. Set Up Environment Variables

Create a .env file in the project root directory and add any necessary environment variables. For example:

```bash
NEO4J_AUTH=neo4j/password
```
### 3. Build and Run Docker Containers

Use Docker Compose to build and start the back-end services:

```bash
docker-compose up -d --build
```
This will start the following services:

- Neo4j Database: Accessible at bolt://localhost:7687 and http://localhost:7474.
- Flask API: Accessible at http://localhost:5001.

### 4. Install Front-End Dependencies

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```
### 5. Start the React Application

Start the development server:

```bash
npm start
```
This will run the application at http://localhost:3000.

## Usage

### Access the Application

Open your web browser and navigate to http://localhost:3000.

### Explore the Graph

- Zoom and Pan: Use your mouse or trackpad to zoom in/out and pan around the graph.
- Click on Nodes: Click on any node to view detailed information in the sidebar.
- Drag Nodes: Click and drag nodes to rearrange them for better visibility.

### Search Nodes

- Enter a search term in the search bar at the top.
- Click Search to highlight matching nodes.
- Click Reset to return to the full graph view.

### Create New Threat Scenarios

- Scroll down to the Create New Threat Scenario form.
- Enter the name and description of the new threat scenario.
- Click Create Threat Scenario to add it to the graph.

## Project Structure

```
threat-mosaic-app/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── import_stix.py
│   ├── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Graph.js
│   │   │   ├── NodeDetails.js
│   │   │   ├── SearchBar.js
│   │   │   └── NewThreatForm.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles.css
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Documentation

### Base URL

All API endpoints are accessed via http://localhost:5001/api/.

### API Endpoints

GET /api/threat_scenarios
Retrieve all threat scenarios along with their associated techniques.

URL: /api/threat_scenarios
Method: GET
Description: Fetches all threat scenarios from the database, including their related techniques.
Response
Status Code: 200 OK

Content:

json
Copy code
[
  {
    "id": "uuid-1",
    "name": "Threat Scenario 1",
    "description": "Description of Threat Scenario 1",
    "techniques": [
      {
        "id": "tech-uuid-1",
        "name": "Technique 1",
        "description": "Description of Technique 1",
        "external_id": "T1234"
      },
      {
        "id": "tech-uuid-2",
        "name": "Technique 2",
        "description": "Description of Technique 2",
        "external_id": "T5678"
      }
    ]
  },
  {
    "id": "uuid-2",
    "name": "Threat Scenario 2",
    "description": "Description of Threat Scenario 2",
    "techniques": []
  }
]
POST /api/threat_scenarios
Create a new threat scenario.

URL: /api/threat_scenarios
Method: POST
Description: Adds a new threat scenario to the database.
Request
Headers:

Content-Type: application/json
Body:

json
Copy code
{
  "name": "New Threat Scenario",
  "description": "Description of the new threat scenario."
}
Response
Status Code: 201 Created

Content:

json
Copy code
{
  "id": "generated-uuid",
  "name": "New Threat Scenario",
  "description": "Description of the new threat scenario."
}
Error Responses
400 Bad Request: If the name field is missing.

json
Copy code
{
  "error": "Name is required."
}
POST /api/create_relationship
Create a relationship between two nodes.

URL: /api/create_relationship
Method: POST
Description: Establishes a specified relationship between two existing nodes in the database.
Request
Headers:

Content-Type: application/json
Body:

json
Copy code
{
  "sourceId": "uuid-source",
  "targetId": "uuid-target",
  "relationship": "USES_TECHNIQUE"
}
Response
Status Code: 201 Created

Content:

json
Copy code
{
  "message": "Relationship USES_TECHNIQUE created between uuid-source and uuid-target"
}
Error Responses
400 Bad Request: If any of sourceId, targetId, or relationship is missing.

json
Copy code
{
  "error": "sourceId, targetId, and relationship are required"
}
404 Not Found: If either the source or target node does not exist.

json
Copy code
{
  "error": "Source or target node not found"
}
GET /api/search
Search for nodes based on a query and optional types.

URL: /api/search
Method: GET
Description: Performs a case-insensitive and partial match search for nodes. Can filter by specific types.
Query Parameters
query (string, required): The search term.
type (string, optional): The type(s) of nodes to search. Can be specified multiple times for multiple types.
Example
bash
Copy code
/api/search?query=attack&type=ThreatScenario&type=Technique
Response
Status Code: 200 OK

Content:

json
Copy code
[
  {
    "id": "uuid-1",
    "name": "Attack Technique 1",
    "labels": ["Technique"]
  },
  {
    "id": "uuid-2",
    "name": "Attack Scenario A",
    "labels": ["ThreatScenario"]
  }
]
Error Responses
400 Bad Request: If invalid types are provided.

json
Copy code
{
  "error": "Invalid types: InvalidType1, InvalidType2"
}
500 Internal Server Error: On unexpected server errors.

json
Copy code
{
  "error": "Internal server error."
}
GET /api/related_nodes
Retrieve nodes related to a specific node along with their relationships.

URL: /api/related_nodes
Method: GET
Description: Fetches all nodes connected to the specified node and the types of their relationships.
Query Parameters
nodeId (string, required): The ID of the node to find related nodes for.
Example
bash
Copy code
/api/related_nodes?nodeId=uuid-1
Response
Status Code: 200 OK

Content:

json
Copy code
{
  "nodes": [
    {
      "id": "uuid-2",
      "name": "Related Node 1",
      "labels": ["Technique"]
    },
    {
      "id": "uuid-3",
      "name": "Related Node 2",
      "labels": ["Tool"]
    }
  ],
  "links": [
    {
      "source": "uuid-1",
      "target": "uuid-2",
      "relationship": "USES_TECHNIQUE"
    },
    {
      "source": "uuid-1",
      "target": "uuid-3",
      "relationship": "USES_TOOL"
    }
  ]
}
Error Responses
400 Bad Request: If the nodeId parameter is missing.

json
Copy code
{
  "error": "nodeId parameter is required"
}
Error Handling
The API uses standard HTTP status codes to indicate the success or failure of requests:

200 OK: The request was successful.
201 Created: A resource was successfully created.
400 Bad Request: The request was invalid or cannot be served.
404 Not Found: The requested resource could not be found.
500 Internal Server Error: An unexpected error occurred on the server.
Error responses include a JSON object with an error field describing the issue.

Examples
Creating a Threat Scenario
Request:

bash
Copy code
POST /api/threat_scenarios
Content-Type: application/json

{
  "name": "Phishing Attack",
  "description": "An attempt to acquire sensitive information by masquerading as a trustworthy entity."
}
Response:

json
Copy code
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Phishing Attack",
  "description": "An attempt to acquire sensitive information by masquerading as a trustworthy entity."
}
Searching for Techniques
Request:

bash
Copy code
GET /api/search?query=phish&type=Technique
Response:

json
Copy code
[
  {
    "id": "tech-uuid-1",
    "name": "Spear Phishing",
    "labels": ["Technique"]
  }
]
Retrieving Related Nodes
Request:

bash
Copy code
GET /api/related_nodes?nodeId=550e8400-e29b-41d4-a716-446655440000
Response:

json
Copy code
{
  "nodes": [
    {
      "id": "tech-uuid-1",
      "name": "Spear Phishing",
      "labels": ["Technique"]
    }
  ],
  "links": [
    {
      "source": "550e8400-e29b-41d4-a716-446655440000",
      "target": "tech-uuid-1",
      "relationship": "USES_TECHNIQUE"
    }
  ]
}
Technologies Used
Flask: Web framework for Python.
Flask-CORS: Handling Cross-Origin Resource Sharing (CORS).
Py2neo: Client library and toolkit for working with Neo4j from within Python applications.
Neo4j: Graph database for storing and querying data.
UUID: For generating unique identifiers.





### Endpoints

1. Get Threat Scenarios

	•	Endpoint: GET /api/threat_scenarios
	•	Description: Retrieves all threat scenarios with associated techniques.
	•	Response:

```json
[
  {
    "id": "threat1",
    "name": "Threat Scenario 1",
    "description": "Description of threat scenario 1",
    "techniques": [
      {
        "id": "technique1",
        "name": "Technique 1",
        "description": "Description of technique 1",
        "external_id": "T1001"
      }
    ]
  }
  // More threat scenarios...
]
```

2. Search Nodes

	•	Endpoint: GET /api/search
	•	Query Parameters:
	•	query: The search term.
	•	Description: Searches for nodes whose name contains the query string.
	•	Response:

```json
[
  {
    "id": "node1",
    "name": "Node Name",
    "labels": ["Technique"]
  }
  // More nodes...
]
```

3. Create Threat Scenario

	•	Endpoint: POST /api/threat_scenarios
	•	Description: Creates a new threat scenario.
	•	Request Body:

```json
{
  "name": "New Threat Scenario",
  "description": "Description of the new threat scenario"
}
```
Response:

```json
{
  "id": "generated-id",
  "name": "New Threat Scenario",
  "description": "Description of the new threat scenario"
}
```
## Contributing

Contributions are welcome! Please follow these steps:

- Fork the Repository
- Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

- Commit your Changes

  ```bash
  git commit -m "Add your message here"
  ```
  
- Push to Your Fork

```bash
git push origin feature/your-feature-name
```

- Create a Pull Request (PR)

## Acknowledgments

- React: https://reactjs.org/
- D3.js: https://d3js.org/
- Flask: https://flask.palletsprojects.com/
- Neo4j: https://neo4j.com/

## Additional Documentation

### Setting Up the Neo4j Database

The application uses a Neo4j database to store and manage graph data.

1. Accessing the Neo4j Browser

- Open your web browser and navigate to http://localhost:7474.
- Log in with the credentials specified in your .env file (default username is neo4j, and the password is password).

2. Importing Data

If you need to import initial data into the database:

- Place your STIX data file (e.g., enterprise-attack.json) in the backend directory.
- Run the import script:

```bash
docker-compose exec backend python import_stix.py
```
## API Development Notes

- CORS Configuration: The Flask API has CORS enabled to allow cross-origin requests from the React application.
- Error Handling: API endpoints include basic error handling and return appropriate HTTP status codes.

## Deployment

For production deployment, consider the following:

- Use a Production Web Server: Deploy the Flask API using a production server like Gunicorn or uWSGI.
- Secure Communication: Implement HTTPS using SSL certificates.
- Environment Variables: Use secure methods to manage environment variables and secrets.
- Scaling: Configure Docker Compose or Kubernetes for scalability.

## Frequently Asked Questions

Q: I’m getting a CORS error when trying to access the API. How do I fix this?

A: Ensure that CORS is enabled in your Flask application by including CORS(app) after initializing your Flask app. Also, check that the proxy is correctly set up in your React application’s package.json.

Q: How do I add relationships between nodes?

A: Currently, the application allows creating new threat scenarios. To add relationships, you can extend the API and front-end forms to include functionality for connecting nodes.

Q: Can I import custom data into the graph?

A: Yes, you can modify the import_stix.py script to import custom STIX data or write new scripts to handle different data formats.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

Thank you for using the Threat Mosaic Application!
