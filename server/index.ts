import express from 'express';
import cors from 'cors';
import Ably from 'ably';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const ABLY_API_KEY = process.env.ABLY_API_KEY;

if (!ABLY_API_KEY) {
  console.error("CRITICAL: ABLY_API_KEY is not set in the environment.");
  process.exit(1);
}

// Initialize the official Ably REST client
const restClient = new Ably.Rest(ABLY_API_KEY);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('VIYEKO Auth Server is running.');
});

// Secure Token Request endpoint
app.get('/auth/ably', async (req, res) => {
  try {
    const clientId = (req.query.clientId as string) || 'anonymous';

    // The Ably SDK natively generates the correct Token Request format
    // including the required Application ID and HMAC signatures.
    const tokenRequestData = await restClient.auth.createTokenRequest({
      clientId: clientId,
      capability: { "*": ["*"] } // Allow full access for testing
    });

    res.json(tokenRequestData);
  } catch (error: any) {
    console.error("Ably Auth Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`VIYEKO Auth Server listening on port ${port}`);
  console.log(`Endpoint ready at: http://localhost:${port}/auth/ably`);
});
