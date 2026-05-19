require("dotenv").config();
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

const tables = [
  {
    TableName: process.env.AWS_DYNAMODB_LISTINGS_TABLE || "Listings",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  },
  {
    TableName: process.env.AWS_DYNAMODB_INQUIRIES_TABLE || "Inquiries",
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "S" },
      { AttributeName: "listingId", AttributeType: "S" },
      { AttributeName: "createdAt", AttributeType: "S" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "listingId-createdAt-index",
        KeySchema: [
          { AttributeName: "listingId", KeyType: "HASH" },
          { AttributeName: "createdAt", KeyType: "RANGE" },
        ],
        Projection: {
          ProjectionType: "ALL",
        },
      },
    ],
    BillingMode: "PAY_PER_REQUEST",
  },
];

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      return false;
    }

    throw error;
  }
}

async function createTables() {
  for (const table of tables) {
    const exists = await tableExists(table.TableName);

    if (exists) {
      console.log(`Table already exists: ${table.TableName}`);
      continue;
    }

    await client.send(new CreateTableCommand(table));
    console.log(`Created table: ${table.TableName}`);
  }

  console.log("\nDone. Your DynamoDB tables are ready.");
}

createTables().catch((error) => {
  console.error("Failed to create tables:", error.message);
  process.exit(1);
});
