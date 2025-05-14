## Steps to run the project

1. Have skaffold installed and run `skaffold dev` in the root directory of the project
2. for running in ubuntu install minikube and run `minikube start` and then `skaffold dev`
3. Use `skaffold dev --port-forward` to forward the ports to the host machine

OR
4. run `minukube service -all` to get the url of the service and open it in the browser
5. run `minikube dashboard` to see the dashboard of the cluster
6. run `minikube stop` to stop the cluster
7. run `minikube delete` to delete the cluster
8. run `minikube addons list` to see the addons installed

9. type `thisisunsafe` in the browser if you see not secure warning

## Creating secret in kube cluster

1. Create a secret in the cluster using the command `kubectl create secret generic jwt-secret --from-literal=JWT_KEY=your_secret_key`
2. Secret for products service
```
❯ kubectl create secret generic products-secrets \
  --from-literal=POSTGRES_USERNAME=username \
  --from-literal=POSTGRES_PASSWORD=password
```

## Docker, Kubernetes, and Skaffold Documentation

### Docker
- Docker is used to containerize the services in this project.
- Each service has its own `Dockerfile` to build the Docker image.
- Ensure Docker is installed and running on your machine.

### Kubernetes
- Kubernetes is used to orchestrate the deployment of services.
- The project uses Minikube for local Kubernetes cluster management.
- Use `minikube start` to start the cluster and `minikube stop` to stop it.
- Secrets are managed using Kubernetes secrets, e.g., `jwt-secret` and `products-secrets`.

### Skaffold
- Skaffold is used for continuous development on Kubernetes.
- Run `skaffold dev` to build and deploy the application continuously.
- Use `skaffold dev --port-forward` to forward ports to the host machine.

## Common Shared Library

### Overview
- A common shared library is used across different services for shared functionality.
- It is published on npm under the organization and name `@cgecommerceproject/common`.

### Usage
- Install the library in other projects using `npm install @cgecommerceproject/common`.
- After updates, publish the library using `npm publish --access public`.
- Update the library in other projects with `npm update @cgecommerceproject/common`.

## Auth Service Documentation

### Overview
The Auth service is responsible for handling authentication and authorization within the application. It is built using Node.js and Express, with TypeScript for type safety.

### Key Features
- User authentication using JWT (JSON Web Tokens).
- Input validation using `express-validator`.
- Session management with `cookie-session`.

### Setup and Installation
1. **Dependencies**: The service relies on several npm packages, including:
   - `express`
   - `jsonwebtoken`
   - `mongoose`
   - `@cgecommerceproject/common` for shared functionality.

2. **Scripts**:
   - `npm start`: Starts the service using `ts-node-dev` for automatic restarts on file changes.

### Running the Service
- Start the service with `npm start`.
- The service will listen for requests and handle authentication operations.

### Security
- JWTs are used for secure authentication.
- Ensure the `JWT_KEY` environment variable is set for token signing.


## Products Service Documentation

### Overview
The Products service manages product data and operations. It is built using Spring Boot and Java, leveraging Spring Data JPA for database interactions.

### Key Features
- RESTful API for product management.
- Integration with PostgreSQL for data persistence.
- Security features using Spring Security.

### Setup and Installation
1. **Dependencies**: The service uses several Maven dependencies, including:
   - `spring-boot-starter-data-jpa`
   - `spring-boot-starter-web`
   - `spring-boot-starter-security`
   - `postgresql` for database connectivity.

2. **Build Configuration**:
   - Managed using Maven with a `pom.xml` file.
   - Java version 21 is required.

3. **Environment Setup**:
   - Ensure you have Java and Maven installed.
   - Configure PostgreSQL database credentials in the application properties.

### Security
- JWTs are used for secure API access.
- Ensure the `products-secrets` are configured in the Kubernetes cluster for database credentials.

## Cart Service Documentation

### Overview
The Cart service is responsible for managing the shopping cart functionality within the application. It is built using Go and leverages Redis for data storage.

### Key Features
- RESTful API for cart management.
- Integration with Redis for fast data access and storage.
- Middleware for logging requests and responses.

### Setup and Installation

1. **Dependencies**: The service relies on several Go packages, including:
   - `github.com/go-redis/redis/v8` for Redis client operations.
   - `github.com/google/uuid` for generating unique cart IDs.
   - `github.com/gorilla/mux` for HTTP request routing.

2. **Build Configuration**:
   - The service is containerized using Docker. The `Dockerfile` is configured to build the Go application and run it in an Alpine Linux container.

3. **Environment Setup**:
   - Ensure you have Docker installed and running on your machine.
   - The service is configured to connect to a Redis instance running at `cart-redis-srv:6379`.

4. **Running the Service**:
   - Build and run the Docker container using the provided `Dockerfile`.
   - The service listens on port `8080` for incoming HTTP requests.

### Security
- Ensure that the Redis instance is secured and only accessible by the Cart service.
- Consider using environment variables for sensitive configurations, such as Redis connection details.

### API Endpoints
- `GET /api/cart/health`: Check the health status of the service.
- `GET /api/cart/{user_id}`: Retrieve the cart for a specific user.
- `POST /api/cart/{user_id}/items`: Add an item to the user's cart.
- `PUT /api/cart/{user_id}/items/{product_id}`: Update the quantity of an item in the cart.
- `DELETE /api/cart/{user_id}/items/{product_id}`: Remove an item from the cart.
- `DELETE /api/cart/{user_id}/clear`: Clear all items from the user's cart.

Note:- sometimes if `skaffold dev --port-forward` gives this kind of error
```
 deployment/products-depl is ready. [6/7 deployment(s) still pending]
 - deployment/products-postgres-depl is ready. [5/7 deployment(s) still pending]
 - deployment/auth-depl is ready. [4/7 deployment(s) still pending]
 - deployment/client-depl is ready. [3/7 deployment(s) still pending]
 - deployment/cart-redis-depl is ready. [2/7 deployment(s) still pending]
 - deployment/cart-depl: container cart terminated with exit code 1
    - pod/cart-depl-fcc68fc68-s2ftl: container cart terminated with exit code 1
      > [cart-depl-fcc68fc68-s2ftl cart] 2025/05/14 10:52:03 Failed to connect to Redis: dial tcp 10.102.137.174:6379: connect: connection refused
 - deployment/cart-depl failed. Error: container cart terminated with exit code 1.
```
then run `skaffold delete` and then `skaffold dev --port-forward` again or
first run `kubectl apply -f infra/k8s/cart-redis-depl.yaml` and then `skaffold dev --port-forward` again, to ensure the redis pod is up and running before the cart service pod starts.

