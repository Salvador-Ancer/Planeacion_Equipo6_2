echo delete frontend deployment and service...
kubectl -n default delete deployment todolistapp-springboot-deployment-c55f89769-6zs6b --ignore-not-found
kubectl -n default delete deployment todolistapp-springboot-deployment-c55f89769-jnm9d --ignore-not-found
kubectl -n default delete service todolistapp-springboot-service --ignore-not-found