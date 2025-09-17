# Chatbot Backend

A Node.js backend for a RAG-powered news chatbot using ChromaDB, Redis, and Google Gemini.

## Prerequisites

- Node.js (v18+)
- Redis server running on `localhost:6379`
- ChromaDB server running on `localhost:8000`
- Hugging Face API key
- Google Gemini API key

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install and start ChromaDB:**
   ```bash
   # Option 1: Using pip
   pip install chromadb
   chroma run --host localhost --port 8000
   
   # Option 2: Using Docker
   docker run -p 8000:8000 chromadb/chroma
   ```

3. **Start Redis:**
   ```bash
   # Windows (if installed)
   redis-server
   
   # Or using Docker
   docker run -p 6379:6379 redis:alpine
   ```

4. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Add your API keys to `.env`:
   ```
   HF_API_KEY=your_huggingface_api_key
   GEMINI_API_KEY=your_gemini_api_key
   CHROMA_URL=http://localhost:8000
   CHROMA_COLLECTION=news_articles
   REDIS_URL=redis://localhost:6379
   ```

5. **Ingest news data into ChromaDB:**
   ```bash
   npm run ingest
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:4000`

## API Endpoints

- `POST /api/session` - Create new chat session
- `POST /api/chat/ask` - Send message to chatbot
- `GET /api/history/:sessionId` - Get chat history
- `DELETE /api/history/:sessionId` - Clear chat history
- `GET /api/health` - Health check

## Environment Variables

- `HF_API_KEY` - Hugging Face API key for embeddings
- `GEMINI_API_KEY` - Google Gemini API key for LLM
- `CHROMA_URL` - ChromaDB server URL (default: http://localhost:8000)
- `CHROMA_COLLECTION` - Collection name (default: news_articles)
- `REDIS_URL` - Redis connection URL (default: redis://localhost:6379)
- `PORT` - Server port (default: 4000)



