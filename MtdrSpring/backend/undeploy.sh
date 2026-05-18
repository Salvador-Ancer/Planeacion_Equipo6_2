echo delete frontend deployment and service...
             kubectl delete deployment todolistapp-springboot-deployment -n default --ignore-not-found;
             kubectl delete service todolistapp-springboot-service -n default --ignore-not-found;
             kubectl delete service todolistapp-backend-router -n default --ignore-not-found;