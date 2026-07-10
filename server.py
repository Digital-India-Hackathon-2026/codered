import os
import json
import uuid
import shutil
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

# Import our custom pipeline modules
from ffp import FFPipeline
from mpr import MultiPathRetriever
from mpr.vector_store import VectorStore
from drr import DocumentReranker
from generator import Generator, CorrectnessEvaluator

app = FastAPI(title="FinSage Financial RAG Dashboard")

# Enable CORS for development convenience
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables/singletons initialized on startup
UPLOAD_DIR = "./uploaded_documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize modules
vector_store = VectorStore()
retriever = MultiPathRetriever(vector_store)
reranker = DocumentReranker()
generator = Generator()
evaluator = CorrectnessEvaluator()
ffp_pipeline = FFPipeline()

# Mount static files and templates
os.makedirs("./static", exist_ok=True)
os.makedirs("./templates", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

class QueryRequest(BaseModel):
    query: str
    query_year: Optional[int] = 2026
    reference_answer: Optional[str] = None

@app.get("/", response_class=HTMLResponse)
async def serve_dashboard():
    """Serves the main dashboard page."""
    html_path = "./templates/index.html"
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            return f.read()
    return """
    <html>
        <head><title>FinSage</title></head>
        <body style="font-family: sans-serif; padding: 2rem; background: #0d1117; color: white;">
            <h2>FinSage Backend is Running</h2>
            <p>Please create <code>templates/index.html</code> to display the visual dashboard.</p>
        </body>
    </html>
    """

@app.post("/upload")
async def upload_document(file: UploadFile = File(...), document_year: int = Form(2025)):
    """
    Uploads a financial PDF report and runs it through the FFP Preprocessing pipeline.
    The resulting chunks are indexed in the VectorStore and BM25 retriever.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        # Save upload file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"[Upload] Saved PDF to {file_path}. Initiating FFP pipeline.")
        
        # Run FFP Pipeline
        chunks = ffp_pipeline.process_pdf(file_path)
        
        # Tag the document year in the metadata of all chunks
        for chunk in chunks:
            chunk["metadata"]["year"] = document_year
            
        # Fit MPR (Indexes in vector store and fits BM25)
        retriever.fit(chunks)
        
        return {
            "status": "success",
            "message": f"Successfully parsed and indexed '{file.filename}'",
            "chunks_count": len(chunks),
            "document_year": document_year
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")

@app.get("/chunks")
async def get_all_chunks():
    """Returns all currently indexed chunks for browser visualization."""
    return {
        "count": len(vector_store.chunks_db),
        "chunks": vector_store.chunks_db
    }

@app.post("/query")
async def run_query(request: QueryRequest):
    """
    Runs a query through the full FinSage RAG pipeline:
    1. Multi-Path Retrieval (MPR) (Dense, Lexical, HyDE, Metadata, Expansion)
    2. Document Re-ranking (DRR) (Cross-encoder + Temporal Bonus)
    3. Answer Generation (Generator)
    4. Optional QA Correctness Evaluation
    """
    query = request.query
    query_year = request.query_year
    ref_ans = request.reference_answer

    # Check if documents have been indexed. If not, fallback to direct answer generation.
    if not vector_store.chunks_db:
        try:
            print("[Query] No documents indexed yet. Falling back to direct LLM generation.")
            generated_answer = generator.generate_answer_direct(query)
            
            # 4. Optional Evaluation
            evaluation_results = None
            if ref_ans and ref_ans.strip():
                evaluation_results = evaluator.evaluate(query, generated_answer, ref_ans)

            return {
                "query": query,
                "query_year": query_year,
                "generated_answer": generated_answer,
                "evaluation": evaluation_results,
                "diagnostic": {
                    "mpr_retrieved_count": 0,
                    "mpr_chunks": [],
                    "drr_reranked_chunks": [],
                    "selected_chunks": []
                }
            }
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Direct generation error: {str(e)}")

    try:
        # 1. Multi-Path Retrieval (MPR)
        retrieved_chunks = retriever.retrieve(query, top_k_per_path=5)
        
        # Keep a copy of MPR output for visualization before re-ranking
        mpr_outputs = [c.copy() for c in retrieved_chunks]
        
        # 2. Document Re-ranking (DRR)
        reranked_chunks = reranker.rerank(query, retrieved_chunks, query_year=query_year)
        
        # Select top-5 chunks for generation (as set in paper evaluation, K=5 retrieved chunks)
        top_k = min(5, len(reranked_chunks))
        selected_chunks = reranked_chunks[:top_k]
        
        # 3. Answer Generation
        generated_answer = generator.generate_answer(query, selected_chunks)
        
        # 4. Optional Evaluation
        evaluation_results = None
        if ref_ans and ref_ans.strip():
            evaluation_results = evaluator.evaluate(query, generated_answer, ref_ans)

        return {
            "query": query,
            "query_year": query_year,
            "generated_answer": generated_answer,
            "evaluation": evaluation_results,
            "diagnostic": {
                "mpr_retrieved_count": len(mpr_outputs),
                "mpr_chunks": mpr_outputs,
                "drr_reranked_chunks": reranked_chunks,
                "selected_chunks": selected_chunks
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Set default port to 8000
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
