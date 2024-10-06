# Threat Detection Graph Application

Welcome to the **Threat Detection Graph Application** repository! This application is a powerful tool for visualizing and managing threat scenarios, techniques, and mitigations using an interactive graph interface. Built with **React**, **D3.js**, **Flask**, and **Neo4j**, it allows users to search, explore, and create new threat scenarios directly from the web interface.

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
- [License](#license)
- [Contact](#contact)
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

![Threat Detection Graph Screenshot](Threat_Mosaic.png)

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
