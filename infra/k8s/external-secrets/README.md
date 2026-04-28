# External Secrets Operator (ESO) — migration scaffolding

This directory replaces the in-cluster, base64-only `backend-secrets` Secret with one
synced from **AWS Secrets Manager**. Rotation, audit logs, and IAM-scoped reads all
come for free.

## Why migrate

Current `infra/k8s/overlays/prod/secrets.yaml` stores the AWS access keys, DB password,
Groq + Pinecone API keys, and JWT private key in a plain `Secret`. Anyone with
`kubectl get secret -n clashcode -o yaml` reads them in cleartext (base64 ≠ encryption).

After migration:
- Real secrets live in AWS Secrets Manager (encrypted, versioned, IAM-gated).
- The cluster pulls them via IRSA — no static AWS credentials inside the cluster.
- Rotation = update Secrets Manager → ESO refreshes the k8s `Secret` automatically.

## One-time setup

### 1. Rotate every credential in `secrets.yaml` first

The leaked values (AWS keys, Groq, Pinecone, DB password, JWT private key, Django
SECRET_KEY) are compromised. Generate fresh ones before anything else.

### 2. Create the secret in Secrets Manager

```bash
aws secretsmanager create-secret \
  --region ap-south-1 \
  --name clashcode/prod/backend \
  --secret-string file://./prod-backend.json
```

`prod-backend.json` is a flat JSON object with the new key/value pairs (do not commit).
Example structure:

```json
{
  "SECRET_KEY": "<new django key>",
  "DB_PASSWORD": "<new>",
  "AWS_ACCESS_KEY_ID": "<new>",
  "AWS_SECRET_ACCESS_KEY": "<new>",
  "GROQ_API_KEY": "<new>",
  "PINECONE_API_KEY": "<new>",
  "INTERNAL_SIGNING_SECRET": "<new>",
  "JWT_PRIVATE_KEY": "<new PEM>",
  "JWT_PUBLIC_KEY": "<new PEM>"
}
```

### 3. Create an IAM role for the ESO service account (IRSA)

In `infra/terraform/modules/eks` add an IRSA role with this policy attached:

```hcl
data "aws_iam_policy_document" "eso_secrets_read" {
  statement {
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret",
    ]
    resources = [
      "arn:aws:secretsmanager:ap-south-1:317451122305:secret:clashcode/prod/*",
    ]
  }
}
```

Bind the role to the `external-secrets/external-secrets` service account using the
EKS OIDC provider.

### 4. Install the operator (one-shot, cluster-wide)

```bash
kubectl apply -f https://github.com/external-secrets/external-secrets/releases/download/v0.10.7/external-secrets.yaml
```

### 5. Apply the ClusterSecretStore + ExternalSecret

```bash
kubectl apply -f infra/k8s/external-secrets/cluster-secret-store.yaml
kubectl apply -f infra/k8s/external-secrets/external-secret.yaml
```

### 6. Switch the prod overlay

In `infra/k8s/overlays/prod/kustomization.yaml`, swap:

```yaml
resources:
  - ../../base
  - ./secrets.yaml         # remove this
  - ./ingress.yaml
```

with:

```yaml
resources:
  - ../../base
  - ../../external-secrets/external-secret.yaml
  - ./ingress.yaml
```

ESO will create a `Secret/backend-secrets` matching the original schema; all existing
Deployments keep working unchanged.

### 7. Delete the legacy secret

```bash
kubectl -n clashcode delete secret backend-secrets   # (will be recreated by ESO)
rm infra/k8s/overlays/prod/secrets.yaml
git rm --cached -- '...' if it ever made it into git
```
