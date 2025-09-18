# This is app.py - The AI's Brain

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.vectorstores import Chroma
from langchain.document_loaders import DirectoryLoader, TextLoader
from langchain.chains import RetrievalQA

# --- 1. SETUP ---
app = Flask(__name__)
CORS(app) # Allows website to talk to this AI

# Put your API Key here
os.environ["GOOGLE_API_KEY"] = "AlzaSyDwdZV1T5gyny0D5Hhf_ATHW5gUQ8gu7Z0"

# --- 2. LOAD THE AI'S "TEXTBOOK" ---
# This loads all your .txt files from the knowledge_base folder
loader = DirectoryLoader('./knowledge_base/', glob="**/*.txt", loader_cls=TextLoader)
documents = loader.load()
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
vector_store = Chroma.from_documents(documents, embeddings)
retriever = vector_store.as_retriever()

# --- 3. SETUP THE GOOGLE AI MODEL ---
llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)

# This is the RAG (Retrieval-Augmented Generation) chain.
# It forces the AI to answer ONLY from your textbook files.
qa_chain = RetrievalQA.from_chain_type(llm=llm, chain_type="stuff", retriever=retriever)

# --- 4. CREATE THE CHAT ENDPOINT ---
@app.route("/ask", methods=['POST'])
def ask():
    # Get the user's question from the website
    message = request.get_json()['question']
    
    # Get the safe answer from the AI
    result = qa_chain({"query": message})
    
    # Send the answer back to the website
    return jsonify({"answer": result['result']})

# --- 5. START THE BRAIN ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)