def check_code(code: str, language: str) -> dict:
    return{
        "issues": [
        {
            "line": 1,
            "problem": "Example: missing colon",
            "hint": "Add a':' at the end of the line"
        }
        ]
            
    }