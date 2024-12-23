# File Comparator

A web-based tool for comparing file versions using JSON input.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Prepare your JSON file in the following format:
```json
{
    "contents": [
        {
            "file_name": "example1.js",
            "desc": "Description of the first version",
            "code": "// Your code here"
        },
        {
            "file_name": "example2.js",
            "desc": "Description of changes made",
            "code": "// Modified code here"
        }
        // ... more file versions ...
    ]
}
```

## Running the Service

1. Start the development server:
```bash
npm run dev
```

2. Open your web browser and navigate to:
```
http://localhost:3300
```

## Usage

1. Click "Choose File" and select your JSON file
2. Click "Display Diff" to start comparing
3. Use "Previous" and "Next" buttons to navigate through file versions
4. Each version shows:
   - File name in the header
   - Description of changes
   - Code with highlighted differences

## Development

- Run with debugger: `npm run dev`
- Production mode: `npm start`
