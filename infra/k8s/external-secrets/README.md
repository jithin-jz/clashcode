# External Secrets Management

| Provider | AWS Secrets Manager |
| --- | --- |
| Operator | External Secrets (ESO) |
| Identity | IAM Roles for Service Accounts (IRSA) |

Infrastructure layer for secure, dynamic secret synchronization between AWS Secrets Manager and Kubernetes.

## Architecture

1. Secret Definition | Credentials stored in AWS Secrets Manager (AP-SOUTH-1).
2. Store | ClusterSecretStore abstracts the cloud provider connection using OIDC pod identity.
3. Sync | ExternalSecret resource defines the mapping and refresh interval.
4. Consumption | Standard Kubernetes Secret (`backend-secrets`) created and managed by ESO.

## Provisioning

### 1. Data Ingestion
Populate Secrets Manager with the required service credentials (JSON format).
* Path: `clashcode/prod/backend`

### 2. Identity & Access (IAM)
Attach the following policy to the EKS Service Account role:
* Action: `secretsmanager:GetSecretValue`, `secretsmanager:DescribeSecret`
* Resource: `arn:aws:secretsmanager:ap-south-1:*:secret:clashcode/prod/*`

### 3. Cluster Configuration
```bash
# Deploy operator
kubectl apply -f https://github.com/external-secrets/external-secrets/releases/download/v0.10.7/external-secrets.yaml

# Apply store and synchronization manifests
kubectl apply -f cluster-secret-store.yaml
kubectl apply -f external-secret.yaml
```

## Security Rationale
* Elimination of static, long-lived AWS credentials within the cluster.
* Automated credential rotation support.
* Granular audit logging via AWS CloudTrail.
* AES-256 encryption at rest within AWS Secrets Manager.
