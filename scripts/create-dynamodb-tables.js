const {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} = require("@aws-sdk/client-dynamodb");
const env = require("../src/config/env");

const client = new DynamoDBClient({ region: env.awsRegion });

async function tableExists(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      return false;
    }
    throw error;
  }
}

async function createListingsTable() {
  const exists = await tableExists(env.listingsTable);
  if (exists) {
    console.log(`Skipping ${env.listingsTable}: already exists`);
    return;
  }

  await client.send(
    new CreateTableCommand({
      TableName: env.listingsTable,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    })
  );

  console.log(`Created table ${env.listingsTable}`);
}

async function createInquiriesTable() {
  const exists = await tableExists(env.inquiriesTable);
  if (exists) {
    console.log(`Skipping ${env.inquiriesTable}: already exists`);
    return;
  }

  await client.send(
    new CreateTableCommand({
      TableName: env.inquiriesTable,
      BillingMode: "PAY_PER_REQUEST",
      AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "S" },
        { AttributeName: "listingId", AttributeType: "S" },
        { AttributeName: "createdAt", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      GlobalSecondaryIndexes: [
        {
          IndexName: "listingId-createdAt-index",
          KeySchema: [
            { AttributeName: "listingId", KeyType: "HASH" },
            { AttributeName: "createdAt", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
        },
      ],
    })
  );

  console.log(`Created table ${env.inquiriesTable}`);
}

async function main() {
  await createListingsTable();
  await createInquiriesTable();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
