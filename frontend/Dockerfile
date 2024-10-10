# Use an official Node.js image as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy the requirements file into the container at /app
COPY requirements.txt .

RUN npm install cytoscape cytoscape-context-menus cytoscape-cose-bilkent cytoscape-popper tippy.js
RUN npm install tippy.js@6
# Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 for the React app
EXPOSE 3000

# Start the React application
CMD ["npm", "start"]