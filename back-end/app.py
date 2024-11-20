from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import json
import sqlite3
import os
from typing import List, Dict, Any
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
sql_directory = '../data/sqldata'
database_file = os.path.join(sql_directory, 'water_quality_data.db')

# OpenAI client setup
client = OpenAI(
)
# Pydantic models for request/response validation
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

def get_distinct_locations():
    """Retrieve distinct locations from the database"""
    try:
        with sqlite3.connect(database_file) as connection:
            cursor = connection.cursor()
            cursor.execute("SELECT DISTINCT location FROM water_quality_data;")
            return [row[0] for row in cursor.fetchall()]
    except sqlite3.Error as e:
        return f"Error fetching locations: {e}"

def execute_sql_query(query: str) -> str:
    """Execute SQL query and return results"""
    try:
        with sqlite3.connect(database_file) as connection:
            cursor = connection.cursor()
            cursor.execute(query)
            
            if query.strip().upper().startswith("SELECT"):
                rows = cursor.fetchall()
                column_names = [description[0] for description in cursor.description]
                results = [dict(zip(column_names, row)) for row in rows]
                return json.dumps(results, indent=2) if results else "No data found."
            else:
                connection.commit()
                return f"Query executed successfully: {query.strip().split()[0]}."
    except sqlite3.Error as e:
        return f"An error occurred: {e}"

# Tools configuration for OpenAI
tools = [
    {
        "type": "function",
        "function": {
            "name": "execute_sql_query",
            "description": "Execute an SQL query on the SQLite database and return results.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The SQL query string to be executed"
                    }
                },
                "required": ["query"],
                "additionalProperties": False
            },
        }
    }
]

# System prompt
system_prompt = f"""
You are a data analyst chatbot. Here is the SQL schema of the table you will be looking up data from.
if the user ask a question in another language, answer that question in that language, otherwise it is
always English:
CREATE TABLE IF NOT EXISTS water_quality_data (
    date DATE,
    time TIME,
    location VARCHAR(255),
    
    -- Measurements
    nhiet_do_nuoc FLOAT,              -- Vietnamese for temperature
    temperature FLOAT,
    do_man FLOAT,                     -- Vietnamese for salinity
    salinity FLOAT,
    ph FLOAT,
    kiem FLOAT,                       -- Vietnamese for alkalinity
    alkalinity FLOAT,
    do_trong FLOAT,                   -- Vietnamese for transparency
    transparency FLOAT,
    dissolved_oxygen FLOAT,
    do_hoa_tan FLOAT,                 -- Vietnamese for dissolved oxygen
    do_man_so_voi_nam_truoc FLOAT,    -- Vietnamese for salinity comparison
    salinity_comparison_previous_year FLOAT
)

Known locations from the data (separated by |):
{ " | ".join(get_distinct_locations()) }

Instructions:
1. If the user mentions a location, check if it matches one of the known locations exactly.
2. If there is no exact match, compare the user's input to the known locations and select the closest match.
3. Replace the user-provided location with the closest match and query the database using the matched location.
4. Inform the user about the replacement in your response.
"""

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    messages = [{"role": "system", "content": system_prompt}]
    
    try:
        while True:
            # Receive message from client
            user_message = await websocket.receive_text()
            messages.append({"role": "user", "content": user_message})

            # Get response from OpenAI
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                tools=tools,
            )
            
            assistant_message = response.choices[0].message
            tool_calls = assistant_message.tool_calls

            # Handle tool calls if present
            if tool_calls:
                messages.append(assistant_message)
                
                for tool_call in tool_calls:
                    if tool_call.function.name == "execute_sql_query":
                        tool_args = json.loads(tool_call.function.arguments)
                        query_result = execute_sql_query(tool_args["query"])
                        
                        messages.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": "execute_sql_query",
                            "content": query_result,
                        })

                # Get final response
                second_response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages
                )
                final_message = second_response.choices[0].message
                messages.append(final_message)
                await websocket.send_text(final_message.content)
            else:
                await websocket.send_text(assistant_message.content)
                messages.append(assistant_message)
                
    except Exception as e:
        await websocket.send_text(f"Error: {str(e)}")
        
@app.get("/")
async def root():
    return {"message": "Water Quality Analysis API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)