# Enabling HTTPS on the public ALB

> Status: **deferred**. Leave HTTP only until a domain + ACM cert are ready.

## Steps when you're ready

1. **Buy / point a domain** (e.g. `api.clashcode.app`) at the ALB.
   ```
   k8s-clashcodeprodgrou-85be469269-426753335.ap-south-1.elb.amazonaws.com
   ```

2. **Request an ACM certificate in `ap-south-1`** for that hostname (DNS validation).

3. **Annotate `infra/k8s/overlays/prod/ingress.yaml`** with:
   ```yaml
   alb.ingress.kubernetes.io/certificate-arn: <ACM-CERT-ARN>
   alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
   alb.ingress.kubernetes.io/ssl-redirect: '443'
   ```
   And add a `host:` selector on each rule.

4. **(Optional)** Install cert-manager for internal mTLS / cluster issuers:
   ```
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.1/cert-manager.yaml
   ```

5. Apply with `kustomize build infra/k8s/overlays/prod | kubectl apply -f -`.
