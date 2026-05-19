require("dotenv").config();
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

const tables = [
  {
    TableName: process.env.LISTINGS_TABLE || "Listings",
    KeySchema: [{ AttributeName: "listingId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "listingId", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST", // no capacity planning needed
  },
  {
    TableName: process.env.INQUIRIES_TABLE || "Inquiries",
    KeySchema: [{ AttributeName: "inquiryId", KeyType: "HASH" }],
    AttributeDefinitions: [{ AttributeName: "inquiryId", AttributeType: "S" }],
    BillingMode: "PAY_PER_REQUEST",
  },
];

async function tableExists(name) {
  try {
    await client.send(new DescribeTableCommand({ TableName: name }));
    return true;
  } catch (e) {
    if (e.name === "ResourceNotFoundException") return false;
    throw e;
  }
}

async function createTables() {
  for (const table of tables) {
    const exists = await tableExists(table.TableName);
    if (exists) {
      console.log(`✓ Table already exists: ${table.TableName}`);
    } else {
      await client.send(new CreateTableCommand(table));
      console.log(`✓ Created table: ${table.TableName}`);
    }
  }
  console.log("\nDone. Your DynamoDB tables are ready.");
}

createTables().catch((err) => {
  console.error("Failed to create tables:", err.message);
  process.exit(1);
});