name: Deploy to ArgoCD

on:
  workflow_dispatch:
    inputs:
      versionId:
        required: true
        type: string
      projectName:
        required: true
        type: string
      imageTag:
        required: true
        type: string
      domain:
        required: true
        type: string
      helmValues:
        required: true
        type: string
      callbackUrl:
        required: true
        type: string

jobs:
  deploy-to-argocd:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout ArgoCD Apps Repository
        uses: actions/checkout@v4
        with:
          repository: GRPC-OK/argocd-apps
          token: ${{ secrets.INTELLISIA_GITHUB_TOKEN }}
          path: argocd-apps

      - name: Apply Helm Values from backend
        run: |
          PROJECT_DIR="argocd-apps/helm-projects/${{ inputs.projectName }}"
          mkdir -p "$PROJECT_DIR"
          echo '${{ inputs.helmValues }}' | jq '.' > "$PROJECT_DIR/values.yaml"

      - name: Commit and Push Changes
        run: |
          cd argocd-apps
          git config user.name "Intellisia Deploy Bot"
          git config user.email "deploy-bot@intellisia.com"
          git add helm-projects/${{ inputs.projectName }}/values.yaml
          git commit -m "Deploy ${{ inputs.projectName }} version ${{ inputs.imageTag }}"
          git push origin main

      - name: Update Deployment Status to Backend
        if: always()
        run: |
          if [ "${{ job.status }}" == "success" ]; then
            STATUS="success"
          else
            STATUS="fail"
          fi

          curl -X POST "${{ inputs.callbackUrl }}?status=$STATUS"
