# Microservices E-Commerce Platform

A comprehensive e-commerce platform built with microservices architecture using Kubernetes, Docker, and multiple programming languages.

## Project Overview

This project is a full-featured e-commerce application with the following services:
- **Auth Service**: User authentication and authorization (Node.js/Express)
- **Products Service**: Product catalog management (Spring Boot/Java)
- **Cart Service**: Shopping cart functionality (Go)
- **Orders Service**: Order management (Node.js/Express)
- **Payments Service**: Payment processing with Stripe integration (Node.js/Express)
- **Client**: Frontend application (Next.js/React)

## Demo Video

[Demo Video](assets/demo-video.mp4)

## Steps to Run the Project

### Prerequisites
- Docker and Kubernetes installed
- Skaffold installed
- Minikube installed (for local development)
- Stripe account (for payment processing)

### Setup Instructions

1. Start Minikube:
   ```
   minikube start
   ```

2. Create required Kubernetes secrets:
   ```
   # JWT authentication secret
   kubectl create secret generic jwt-secret --from-literal=JWT_KEY=your_secret_key

   # Products service database credentials
   kubectl create secret generic products-secrets \
     --from-literal=POSTGRES_USERNAME=username \
     --from-literal=POSTGRES_PASSWORD=password

   # Stripe API key for payments service
   kubectl create secret generic stripe-secret \
     --from-literal=STRIPE_KEY=your_stripe_secret_key
   ```

3. Start the application with Skaffold:
   ```
   skaffold dev --port-forward
   ```

4. To access it on `amazon.dev`, add the `minikube ip` in `/etc/hosts` file

### Alternative Commands

- View all services: `minikube service -all`
- Access Kubernetes dashboard: `minikube dashboard`
- Stop Minikube: `minikube stop`
- Delete Minikube cluster: `minikube delete`
- List Minikube addons: `minikube addons list`

### Troubleshooting

- If you see a browser security warning, type `thisisunsafe` in Chrome to bypass it
- If Redis connection issues occur with the Cart service:
  ```
  # First apply the Redis deployment
  kubectl apply -f infra/k8s/cart-redis-depl.yaml

  # Then restart Skaffold
  skaffold delete
  skaffold dev --port-forward
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

## Orders and Payments Services Documentation

### Overview
The Orders and Payments services are separate microservices that handle order management and payment processing within the application. Both services are built using Node.js, Express, and TypeScript, with MongoDB for data persistence, but they serve different purposes in the overall architecture. The Payments service specifically integrates with Stripe for payment processing.

### Key Features

#### Orders Service
- Order creation and management with product details
- Order status tracking (Created, Cancelled, Awaiting Payment, Complete)
- Order expiration handling
- Stores complete product information within orders
- Integration with other services through event-based communication

#### Payments Service
- Secure payment processing using Stripe
- Order verification before payment
- Payment record management
- User authorization checks for payment operations
- Maintains its own copy of order data for payment processing

### Checkout Flow

The application implements a complete checkout flow with Stripe integration:

1. **Checkout Process**:
   - User adds products to cart
   - User clicks "Proceed to Checkout" on the cart page
   - System creates an order in both the orders and payments services
   - User is redirected to the order confirmation page

2. **Order Confirmation**:
   - Displays complete order details and summary
   - Shows shipping costs (40 Rs for orders below 499 Rs)
   - Integrates Stripe payment form for secure payment processing
   - Processes payment and updates order status

3. **Payment Processing**:
   - Securely processes payment through Stripe
   - Updates order status upon successful payment
   - Redirects user to orders page after successful payment

4. **Key Frontend Pages**:
   - `checkout.js`: Handles order creation
   - `confirm-order/[orderId].js`: Displays order details and Stripe payment form
   - `orders.js`: Shows user's order history
   - `success.js`: Confirmation page after successful payment

### Microservices Architecture

#### Data Models

1. **Order Model in Orders Service**:
   - Properties: userId, status, expiresAt, products (array with product details and quantity)
   - Each order contains complete product information
   - Uses versioning for optimistic concurrency control
   - Status follows the OrderStatus enum from the common library

2. **Order Model in Payments Service**:
   - Properties: userId, status, price, version
   - Simplified version of the order data needed for payment processing
   - Uses mongoose-update-if-current for optimistic concurrency control
   - Maintained separately from the Orders service's model

3. **Payment Model in Payments Service**:
   - Properties: orderId, stripeId
   - Links payments to their corresponding orders

#### API Endpoints

1. **Orders Service**:
   - `POST /api/orders`: Create a new order with product details and quantity
   - `GET /api/orders`: Retrieve all orders for the current user
   - `GET /api/orders/:id`: Retrieve a specific order with full product information
   - `DELETE /api/orders/:id`: Cancel an order

2. **Payments Service**:
   - `POST /api/payments`: Process a payment for an order using Stripe
   - `POST /api/payments/create-order`: Create a simplified order record in the Payments service (temporary endpoint until async communication is fully implemented)

### Setup and Installation

1. **Dependencies**:

   **Orders Service**:
   - `express` for API routing
   - `mongoose` for MongoDB interactions
   - `express-validator` for input validation
   - `@cgecommerceproject/common` for shared functionality like OrderStatus enum

   **Payments Service**:
   - `express` for API routing
   - `mongoose` for MongoDB interactions
   - `stripe` for payment processing
   - `mongoose-update-if-current` for concurrency control
   - `express-validator` for input validation
   - `@cgecommerceproject/common` for shared functionality

2. **Environment Setup**:
   - Each service has its own MongoDB database
   - Orders service requires its own MongoDB deployment
   - Payments service requires its own MongoDB deployment
   - Payments service requires the Stripe secret key configured in Kubernetes secrets

### Stripe Integration

1. **Configuration**:
   - The Payments service uses the Stripe Node.js SDK
   - Requires a valid Stripe API key stored in Kubernetes secrets
   - Uses Stripe API version "2025-04-30.basil"
   - Frontend uses `react-stripe-checkout` package for the checkout form

2. **Payment Flow**:
   - User enters payment details in the Stripe Elements form on the confirmation page
   - Client sends payment token and orderId to the Payments service
   - Service verifies order existence and user authorization
   - Service creates a Stripe charge with order details
   - Service records the payment in the database
   - Service returns payment and order details to the client
   - User is redirected to the orders page

3. **API Endpoints**:
   - `/api/orders` (POST): Create new order
   - `/api/payments/create-order` (POST): Create order in payments service
   - `/api/orders/:orderId` (GET): Get order details
   - `/api/payments` (POST): Process payment with Stripe

### Security Considerations

1. **API Security**:
   - All endpoints are protected with JWT authentication
   - Order ownership is verified before allowing payment operations
   - Input validation using express-validator

2. **Stripe Security**:
   - Stripe API key is stored securely in Kubernetes secrets
   - Payment information is handled directly by Stripe
   - Metadata is added to payments for audit purposes

### Common Gotchas and Troubleshooting

1. **Stripe API Key**:
   - Ensure the `stripe-secret` is correctly configured in Kubernetes before deploying the Payments service
   - If payments fail with authentication errors, verify the Stripe API key is valid
   - The Stripe API key is only needed for the Payments service, not the Orders service

2. **Microservices Data Consistency**:
   - The Orders and Payments services maintain separate Order models
   - The Payments service has a simplified Order model with just the data needed for payment processing
   - When an order is created in the Orders service, a corresponding record must be created in the Payments service
   - Currently using a temporary `/api/payments/create-order` endpoint until event-based communication is implemented

3. **Order Status Management**:
   - Orders must be in the correct status before payment processing
   - The OrderStatus enum is shared via the common library to ensure consistency between services
   - Implement proper error handling for order status transitions across services

4. **Concurrency Issues**:
   - Both services use versioning to handle concurrent updates
   - Always check the version number when updating orders across services
   - The `mongoose-update-if-current` plugin helps manage document versions

5. **Service Independence**:
   - Each service operates independently with its own database
   - The Payments service can process payments even if the Orders service is temporarily down
   - However, new orders cannot be paid for if the Orders service is down for extended periods

6. **Deployment Order**:
   - Each service has its own MongoDB deployment that should be applied first:
     ```
     kubectl apply -f infra/k8s/orders-mongo-depl.yaml
     kubectl apply -f infra/k8s/payments-mongo-depl.yaml
     ```
   - Then restart the deployment with `skaffold dev --port-forward`

7. **Testing Payments**:
   - Use Stripe test tokens for development and testing
   - Test token: `tok_visa` can be used for successful payment simulation
   - Test token: `tok_chargeDeclined` can be used to simulate declined payments
   - Remember that the Payments service needs a valid order record before processing payment

8. **Shipping Costs**:
   - Shipping costs of 40 Rs are applied to orders below 499 Rs
   - This is calculated and displayed on the order confirmation page
   - The total amount charged includes the shipping cost when applicable

9. **Order Expiration**:
    - Orders have an expiration time (typically 15 minutes)
    - Users must complete payment before the order expires
    - Expired orders are automatically cancelled

