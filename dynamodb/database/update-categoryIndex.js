aws dynamodb update-table \
    --table-name category \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --global-secondary-index-updates \
        "[{\"Create\":{\"IndexName\": \"categoryName-index\",\"KeySchema\":[{\"AttributeName\":\"categoryName\",\"KeyType\":\"HASH\"}], \
        \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 10, \"WriteCapacityUnits\": 5      },\"Projection\":{\"ProjectionType\":\"ALL\"}}}]"