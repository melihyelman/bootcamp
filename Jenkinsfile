
pipeline {
    agent any

    tools {
        maven 'Maven-3.9'
        jdk 'JDK-21'
        nodejs 'Node-20'
    }

    environment {
        REGISTRY = 'ghcr.io'
        IMAGE_NAME = 'melihyelman/bootcamp'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Backend') {
            steps {
                // ghcr.io push işlemleri için kullanılacak token
                withCredentials([usernamePassword(
                    credentialsId: 'github-token',
                    usernameVariable: 'GH_USER',
                    passwordVariable: 'GH_TOKEN'
                )]) {
                    dir('backend') {
                        sh 'mvn clean install -pl common -am -DskipTests'
                        
                        sh """
                            mvn compile jib:build -pl eureka-server -Dimage=\${REGISTRY}/\${IMAGE_NAME}-eureka:latest -Djib.to.auth.username=\${GH_USER} -Djib.to.auth.password=\${GH_TOKEN}
                            mvn compile jib:build -pl api-gateway -Dimage=\${REGISTRY}/\${IMAGE_NAME}-gateway:latest -Djib.to.auth.username=\${GH_USER} -Djib.to.auth.password=\${GH_TOKEN}
                            mvn compile jib:build -pl auth-service -Dimage=\${REGISTRY}/\${IMAGE_NAME}-auth:latest -Djib.to.auth.username=\${GH_USER} -Djib.to.auth.password=\${GH_TOKEN}
                            mvn compile jib:build -pl product-service -Dimage=\${REGISTRY}/\${IMAGE_NAME}-product:latest -Djib.to.auth.username=\${GH_USER} -Djib.to.auth.password=\${GH_TOKEN}
                            mvn compile jib:build -pl order-service -Dimage=\${REGISTRY}/\${IMAGE_NAME}-order:latest -Djib.to.auth.username=\${GH_USER} -Djib.to.auth.password=\${GH_TOKEN}
                        """
                    }
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github-token',
                    usernameVariable: 'GH_USER',
                    passwordVariable: 'GH_TOKEN'
                )]) {
                    dir('frontend') {
                        sh 'npm install'
                        sh 'npm run build'
                        
                        sh "echo \${GH_TOKEN} | docker login \${REGISTRY} -u \${GH_USER} --password-stdin"
                        sh "docker build -t \${REGISTRY}/\${IMAGE_NAME}-frontend:latest ."
                        sh "docker push \${REGISTRY}/\${IMAGE_NAME}-frontend:latest"
                    }
                }
            }
        }

        stage('Deploy to Coolify') {
            steps {
                withCredentials([
                    string(credentialsId: 'coolify-token', variable: 'COOLIFY_TOKEN'),
                    string(credentialsId: 'coolify-webhook-eureka', variable: 'WEBHOOK_EUREKA'),
                    string(credentialsId: 'coolify-webhook-gateway', variable: 'WEBHOOK_GATEWAY'),
                    string(credentialsId: 'coolify-webhook-auth', variable: 'WEBHOOK_AUTH'),
                    string(credentialsId: 'coolify-webhook-product', variable: 'WEBHOOK_PRODUCT'),
                    string(credentialsId: 'coolify-webhook-order', variable: 'WEBHOOK_ORDER'),
                    string(credentialsId: 'coolify-webhook-frontend', variable: 'WEBHOOK_FRONTEND')
                ]) {
                    sh '''
                        curl -s -X GET "${WEBHOOK_EUREKA}" -H "Authorization: Bearer ${COOLIFY_TOKEN}" || true
                        curl -s -X GET "${WEBHOOK_GATEWAY}" -H "Authorization: Bearer ${COOLIFY_TOKEN}" || true
                        curl -s -X GET "${WEBHOOK_AUTH}" -H "Authorization: Bearer ${COOLIFY_TOKEN}" || true
                        curl -s -X GET "${WEBHOOK_PRODUCT}" -H "Authorization: Bearer ${COOLIFY_TOKEN}" || true
                        curl -s -X GET "${WEBHOOK_ORDER}" -H "Authorization: Bearer ${COOLIFY_TOKEN}" || true
                        curl -s -X GET "${WEBHOOK_FRONTEND}" -H "Authorization: Bearer ${COOLIFY_TOKEN}" || true
                    '''
                }
            }
        }
    }
}
