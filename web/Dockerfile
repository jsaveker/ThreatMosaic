# Use an official Nginx image as the base image
FROM nginx:alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d

# Copy the web content into the container
COPY . /usr/share/nginx/html