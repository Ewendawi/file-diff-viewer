
# File Comparator

A web-based tool for comparing code versions with JSON input.

## Features

- Side-by-side code comparison with syntax highlighting
- Markdown rendering for descriptions and feedback
- Filter content by:
  - Experiment
  - Error type
  - Model
  - Problem
  - Tags
- Single and two-column view modes
- Navigation between file versions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm run dev    # Development mode with hot reload
npm start      # Production mode
```

3. Access the app at:
```
http://localhost:3300
```

## JSON Structure

Your input JSON should follow this format:

```json
{
    "contents": {
        "<id>": {
            "id": "string",
            "language": "string",
            "solution": "string",
            "name": "string",
            "description": "markdown",
            "fitness": "string",
            "feedback": "markdown",
            "error": "string",
            "parent_id": "string",
            "metadata": {
                "error_type": "string",
                "model": "string",
                "prompt": "markdown",
                "raw_response": "markdown",
                "problem": "string",
                "tags": ["string"]
            }
        }
    },
    "experiments": {
        "<experiment_id>": {
            "id": "string",
            "name": "string",
            "id_list": ["string"]
        }
    }
}
```

## Development

- The server serves static files from the public directory
- Supported file types: Java, JavaScript, Python
- Uses the following libraries:
  - [jsdiff](https://github.com/kpdecker/jsdiff) for code comparison
  - [marked](https://github.com/markedjs/marked) for Markdown rendering
  - [Prism](https://prismjs.com/) for syntax highlighting